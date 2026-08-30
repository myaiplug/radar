import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { UNLOCK_CENTS } from "./types";
import { loadAccess, paymentsReady, unlockUser } from "./access";

type CheckoutResult =
  | { ok: true; url: string }
  | { ok: true; unlocked: true }
  | { ok: false; error: string };

function stripeKey(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() ?? "";
}

async function stripeClient() {
  const key = stripeKey();
  if (!key) return null;
  const { default: Stripe } = await import("stripe");
  return new Stripe(key);
}

async function requestOrigin(): Promise<string> {
  if (process.env.BETTER_AUTH_URL?.trim()) {
    return process.env.BETTER_AUTH_URL.trim().replace(/\/$/, "");
  }
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();
  if (!request) return "http://127.0.0.1:8080";
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    "";
  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (host.includes("localhost") || host.startsWith("127.") || host.startsWith("[::1]")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }
  try {
    return new URL(request.url).origin;
  } catch {
    return "http://127.0.0.1:8080";
  }
}

async function grantFromSession(userId: string, sessionId: string): Promise<boolean> {
  const stripe = await stripeClient();
  if (!stripe) return false;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paid = session.payment_status === "paid" || session.status === "complete";
  if (!paid) return false;
  const owner = String(session.metadata?.userId ?? session.client_reference_id ?? "");
  if (!owner || owner !== userId) return false;
  const customer = typeof session.customer === "string" ? session.customer : "";
  await unlockUser(userId, session.id, customer);
  return true;
}

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<CheckoutResult> => {
    const access = await loadAccess(context.userId);
    if (access.plan === "unlocked") return { ok: true, unlocked: true };

    const stripe = await stripeClient();
    if (!stripe) {
      if (!process.env.DATABASE_URL?.trim()) {
        await unlockUser(context.userId, "preview", "");
        return { ok: true, unlocked: true };
      }
      return { ok: false, error: "Checkout is not live yet. Come back on the published desk." };
    }

    const origin = await requestOrigin();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: context.userId,
      metadata: { userId: context.userId },
      success_url: `${origin}/unlock?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: UNLOCK_CENTS,
            product_data: {
              name: "Radar desk",
              description: "Lifetime access. Keep every lead. Hunt without a cap.",
            },
          },
        },
      ],
    });
    if (!session.url) return { ok: false, error: "Stripe did not return a checkout URL." };
    return { ok: true, url: session.url };
  });

export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { sessionId: string }) => input)
  .handler(async ({ context, data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const access = await loadAccess(context.userId);
    if (access.plan === "unlocked") return { ok: true };
    const sessionId = data.sessionId.trim();
    if (!sessionId) return { ok: false, error: "Missing checkout session." };
    if (!paymentsReady()) return { ok: false, error: "Checkout is not live yet." };
    try {
      const granted = await grantFromSession(context.userId, sessionId);
      if (!granted) return { ok: false, error: "Payment is not settled yet." };
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not confirm payment";
      return { ok: false, error: message };
    }
  });

export async function handleStripeWebhook(request: Request): Promise<Response> {
  const stripe = await stripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (!stripe || !secret) {
    return new Response("Stripe webhook is not configured", { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  const raw = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as {
      id: string;
      payment_status?: string;
      metadata?: { userId?: string };
      client_reference_id?: string | null;
      customer?: string | null;
    };
    const userId = String(session.metadata?.userId ?? session.client_reference_id ?? "");
    if (userId) {
      const customer = typeof session.customer === "string" ? session.customer : "";
      await unlockUser(userId, session.id, customer);
    }
  }
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
