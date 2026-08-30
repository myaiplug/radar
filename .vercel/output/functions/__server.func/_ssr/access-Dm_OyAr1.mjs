import { r as createServerFn } from "./ssr.mjs";
import { o as authMiddleware, r as HOLD_MS } from "./types-ilZjrocH.mjs";
import { r as getSql } from "./db-IMLPVCI2.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/access-Dm_OyAr1.js
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
var getAccess_createServerFn_handler = createServerRpc({
	id: "c232d9e9be50004e2a7a822ab196c20a22b9b3594b9e70f831f10a08d4dbe71c",
	name: "getAccess",
	filename: "src/lib/radar/access.ts"
}, (opts) => getAccess.__executeServer(opts));
var getAccess = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getAccess_createServerFn_handler, async ({ context }) => loadAccess(context.userId));
//#endregion
export { getAccess_createServerFn_handler };
