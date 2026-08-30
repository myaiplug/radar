import { r as createServerFn } from "./ssr.mjs";
import { o as authMiddleware } from "./types-ilZjrocH.mjs";
import { c as unlockUser, i as loadAccess, o as paymentsReady } from "./access-Pgm3kykF.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/billing-BDDpjTGK.js
function stripeKey() {
	return process.env.STRIPE_SECRET_KEY?.trim() ?? "";
}
async function stripeClient() {
	const key = stripeKey();
	if (!key) return null;
	const { default: Stripe } = await import("../_libs/stripe.mjs").then((n) => n.t);
	return new Stripe(key);
}
async function requestOrigin() {
	if (process.env.BETTER_AUTH_URL?.trim()) return process.env.BETTER_AUTH_URL.trim().replace(/\/$/, "");
	const { getRequest } = await import("./ssr.mjs").then((n) => n.c).then((n) => n.t);
	const request = getRequest();
	if (!request) return "http://127.0.0.1:8080";
	const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host") || "";
	if (host) return `${request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || (host.includes("localhost") || host.startsWith("127.") || host.startsWith("[::1]") ? "http" : "https")}://${host}`;
	try {
		return new URL(request.url).origin;
	} catch {
		return "http://127.0.0.1:8080";
	}
}
async function grantFromSession(userId, sessionId) {
	const stripe = await stripeClient();
	if (!stripe) return false;
	const session = await stripe.checkout.sessions.retrieve(sessionId);
	if (!(session.payment_status === "paid" || session.status === "complete")) return false;
	const owner = String(session.metadata?.userId ?? session.client_reference_id ?? "");
	if (!owner || owner !== userId) return false;
	const customer = typeof session.customer === "string" ? session.customer : "";
	await unlockUser(userId, session.id, customer);
	return true;
}
var startCheckout_createServerFn_handler = createServerRpc({
	id: "694f0b762738dba039ea81429e99340f033ba703b3adfe054c1de7455ea64744",
	name: "startCheckout",
	filename: "src/lib/radar/billing.ts"
}, (opts) => startCheckout.__executeServer(opts));
var startCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(startCheckout_createServerFn_handler, async ({ context }) => {
	if ((await loadAccess(context.userId)).plan === "unlocked") return {
		ok: true,
		unlocked: true
	};
	const stripe = await stripeClient();
	if (!stripe) {
		if (!process.env.DATABASE_URL?.trim()) {
			await unlockUser(context.userId, "preview", "");
			return {
				ok: true,
				unlocked: true
			};
		}
		return {
			ok: false,
			error: "Checkout is not live yet. Come back on the published desk."
		};
	}
	const origin = await requestOrigin();
	const session = await stripe.checkout.sessions.create({
		mode: "payment",
		client_reference_id: context.userId,
		metadata: { userId: context.userId },
		success_url: `${origin}/unlock?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${origin}/`,
		line_items: [{
			quantity: 1,
			price_data: {
				currency: "usd",
				unit_amount: 500,
				product_data: {
					name: "Radar desk",
					description: "Lifetime access. Keep every lead. Hunt without a cap."
				}
			}
		}]
	});
	if (!session.url) return {
		ok: false,
		error: "Stripe did not return a checkout URL."
	};
	return {
		ok: true,
		url: session.url
	};
});
var confirmCheckout_createServerFn_handler = createServerRpc({
	id: "119a74d4fecdf911ff85a8a945b97d5e5f17ffaf22ab6dab423a7733667aa5d4",
	name: "confirmCheckout",
	filename: "src/lib/radar/billing.ts"
}, (opts) => confirmCheckout.__executeServer(opts));
var confirmCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(confirmCheckout_createServerFn_handler, async ({ context, data }) => {
	if ((await loadAccess(context.userId)).plan === "unlocked") return { ok: true };
	const sessionId = data.sessionId.trim();
	if (!sessionId) return {
		ok: false,
		error: "Missing checkout session."
	};
	if (!paymentsReady()) return {
		ok: false,
		error: "Checkout is not live yet."
	};
	try {
		if (!await grantFromSession(context.userId, sessionId)) return {
			ok: false,
			error: "Payment is not settled yet."
		};
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Could not confirm payment"
		};
	}
});
//#endregion
export { confirmCheckout_createServerFn_handler, startCheckout_createServerFn_handler };
