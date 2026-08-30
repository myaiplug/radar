import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { o as authMiddleware, r as HOLD_MS } from "./types-ilZjrocH.mjs";
import { r as getSql } from "./db-IMLPVCI2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/access-Pgm3kykF.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function paymentsReady() {
	return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}
async function ensureEntitlement(userId) {
	await (await getSql())`
    insert into entitlements (user_id)
    values (${userId})
    on conflict (user_id) do nothing
  `;
}
async function loadAccess(userId) {
	const sql = await getSql();
	await ensureEntitlement(userId);
	const row = (await sql`
    select user_id, plan, stripe_customer_id, stripe_checkout_id,
           hunts_used, tease_started_at::text as tease_started_at,
           unlocked_at::text as unlocked_at
    from entitlements
    where user_id = ${userId}
    limit 1
  `)[0];
	const counts = await sql`
    select count(*)::int as count from leads where user_id = ${userId}
  `;
	const savedCount = Number(counts[0]?.count ?? 0);
	const unlocked = row?.plan === "unlocked";
	const huntsUsed = Number(row?.hunts_used ?? 0);
	const started = row?.tease_started_at ? Date.parse(row.tease_started_at) : NaN;
	const holdEndsAt = unlocked || !Number.isFinite(started) ? null : new Date(started + HOLD_MS).toISOString();
	const holdMsLeft = holdEndsAt ? Math.max(0, Date.parse(holdEndsAt) - Date.now()) : null;
	const dark = !unlocked && holdEndsAt !== null && (holdMsLeft ?? 0) <= 0;
	const huntsLeft = unlocked ? 99 : Math.max(0, 1 - huntsUsed);
	const savesLeft = unlocked ? 99 : Math.max(0, 2 - savedCount);
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
		canHunt: unlocked || huntsLeft > 0 && !dark,
		canSave: unlocked || savesLeft > 0 && !dark,
		canOutreach: unlocked,
		canInspect: unlocked
	};
}
function redactLead(lead, access) {
	if (!access.dark) return {
		...lead,
		locked: false
	};
	return {
		...lead,
		contact: "",
		postUrl: "",
		postQuote: "",
		why: "",
		angle: "",
		nextAction: "",
		notes: "",
		locked: true
	};
}
async function markHuntUsed(userId) {
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
async function unlockUser(userId, checkoutId, customerId) {
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
var getAccess = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("c232d9e9be50004e2a7a822ab196c20a22b9b3594b9e70f831f10a08d4dbe71c"));
//#endregion
export { markHuntUsed as a, unlockUser as c, loadAccess as i, ensureEntitlement as n, paymentsReady as o, getAccess as r, redactLead as s, createSsrRpc as t };
