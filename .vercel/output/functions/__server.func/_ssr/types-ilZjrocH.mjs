import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/types-ilZjrocH.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out (auth on — the default, including live preview) -> throws
* `UnauthorizedError` (see `verify.server.ts`). Only when auth is explicitly
* disabled (`VITE_AUTH_ENABLED=false`) does it resolve the shared dev user and
* never throw. Use it on every server function that touches per-user data, and
* scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-sGid3STf.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-BI1nTXKC.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var STAGES = [
	{
		id: "new",
		label: "New",
		hint: "Just spotted"
	},
	{
		id: "researching",
		label: "Research",
		hint: "Figuring the angle"
	},
	{
		id: "pitched",
		label: "Pitched",
		hint: "Outreach sent"
	},
	{
		id: "negotiating",
		label: "Talks",
		hint: "Live conversation"
	},
	{
		id: "won",
		label: "Booked",
		hint: "Money in motion"
	},
	{
		id: "lost",
		label: "Dead",
		hint: "Closed cold"
	}
];
var STAGE_IDS = STAGES.map((s) => s.id);
var SOURCES = [
	{
		id: "hunt",
		label: "Radar hunt"
	},
	{
		id: "x",
		label: "X"
	},
	{
		id: "reddit",
		label: "Reddit"
	},
	{
		id: "upwork",
		label: "Upwork"
	},
	{
		id: "fiverr",
		label: "Fiverr"
	},
	{
		id: "instagram",
		label: "Instagram"
	},
	{
		id: "local",
		label: "Local"
	},
	{
		id: "referral",
		label: "Referral"
	},
	{
		id: "email",
		label: "Email"
	},
	{
		id: "manual",
		label: "Manual"
	},
	{
		id: "other",
		label: "Other"
	}
];
var CATEGORIES = [
	{
		id: "audio",
		label: "Audio"
	},
	{
		id: "visual",
		label: "Visual"
	},
	{
		id: "words",
		label: "Words"
	},
	{
		id: "code",
		label: "Code & AI"
	}
];
var CHANNELS = [
	{
		id: "dm",
		label: "Cold DM"
	},
	{
		id: "email",
		label: "Email"
	},
	{
		id: "proposal",
		label: "Proposal"
	},
	{
		id: "post",
		label: "Public reply"
	}
];
var HOLD_MS = 1728e5;
function isStageId(value) {
	return STAGE_IDS.includes(value);
}
function sourceLabel(id) {
	return SOURCES.find((s) => s.id === id)?.label ?? id;
}
function formatUsd(value) {
	if (!value) return "$0";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0
	}).format(value);
}
function formatHold(ms) {
	if (ms <= 0) return "gone";
	const totalMin = Math.floor(ms / 6e4);
	const d = Math.floor(totalMin / 1440);
	const h = Math.floor((totalMin - d * 60 * 24) / 60);
	const m = totalMin % 60;
	if (d > 0) return `${d}d ${h}h`;
	if (h > 0) return `${h}h ${m}m`;
	return `${Math.max(1, m)}m`;
}
//#endregion
export { STAGES as a, formatUsd as c, SOURCES as i, isStageId as l, CHANNELS as n, authMiddleware as o, HOLD_MS as r, formatHold as s, CATEGORIES as t, sourceLabel as u };
