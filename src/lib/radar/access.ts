import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  FREE_HUNTS,
  FREE_SAVES,
  HOLD_MS,
  type DeskAccess,
  type Lead,
} from "./types";

type EntitlementRow = {
  user_id: string;
  plan: string;
  stripe_customer_id: string;
  stripe_checkout_id: string;
  hunts_used: number;
  tease_started_at: string | null;
  unlocked_at: string | null;
};

export function paymentsReady(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export async function ensureEntitlement(userId: string): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into entitlements (user_id)
    values (${userId})
    on conflict (user_id) do nothing
  `;
}

export async function loadAccess(userId: string): Promise<DeskAccess> {
  const sql = await getSql();
  await ensureEntitlement(userId);
  const rows = await sql<EntitlementRow>`
    select user_id, plan, stripe_customer_id, stripe_checkout_id,
           hunts_used, tease_started_at::text as tease_started_at,
           unlocked_at::text as unlocked_at
    from entitlements
    where user_id = ${userId}
    limit 1
  `;
  const row = rows[0];
  const counts = await sql<{ count: number }>`
    select count(*)::int as count from leads where user_id = ${userId}
  `;
  const savedCount = Number(counts[0]?.count ?? 0);
  const unlocked = row?.plan === "unlocked";
  const huntsUsed = Number(row?.hunts_used ?? 0);
  const started = row?.tease_started_at ? Date.parse(row.tease_started_at) : NaN;
  const holdEndsAt =
    unlocked || !Number.isFinite(started) ? null : new Date(started + HOLD_MS).toISOString();
  const holdMsLeft = holdEndsAt ? Math.max(0, Date.parse(holdEndsAt) - Date.now()) : null;
  const dark = !unlocked && holdEndsAt !== null && (holdMsLeft ?? 0) <= 0;
  const huntsLeft = unlocked ? 99 : Math.max(0, FREE_HUNTS - huntsUsed);
  const savesLeft = unlocked ? 99 : Math.max(0, FREE_SAVES - savedCount);
  return {
    plan: unlocked ? "unlocked" : "tease",
    paymentsReady: paymentsReady(),
    huntsUsed,
    huntsLeft,
    savedCount,
    savesLeft,
    holdEndsAt,
    holdMsLeft,
    dark,
    canHunt: unlocked || (huntsLeft > 0 && !dark),
    canSave: unlocked || (savesLeft > 0 && !dark),
    canOutreach: unlocked,
    canInspect: unlocked,
  };
}

export function redactLead(lead: Lead, access: DeskAccess): Lead {
  if (!access.dark) return { ...lead, locked: false };
  return {
    ...lead,
    contact: "",
    postUrl: "",
    postQuote: "",
    why: "",
    angle: "",
    nextAction: "",
    notes: "",
    locked: true,
  };
}

export async function markHuntUsed(userId: string): Promise<void> {
  const sql = await getSql();
  await ensureEntitlement(userId);
  await sql`
    update entitlements
    set
      hunts_used = hunts_used + 1,
      tease_started_at = coalesce(tease_started_at, now()),
      updated_at = now()
    where user_id = ${userId}
      and plan <> 'unlocked'
  `;
}

export async function unlockUser(
  userId: string,
  checkoutId: string,
  customerId: string,
): Promise<void> {
  const sql = await getSql();
  await ensureEntitlement(userId);
  await sql`
    update entitlements
    set
      plan = 'unlocked',
      stripe_checkout_id = case
        when ${checkoutId} = '' then stripe_checkout_id
        else ${checkoutId}
      end,
      stripe_customer_id = case
        when ${customerId} = '' then stripe_customer_id
        else ${customerId}
      end,
      unlocked_at = coalesce(unlocked_at, now()),
      updated_at = now()
    where user_id = ${userId}
  `;
}

export const getAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => loadAccess(context.userId));
