import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { a as STAGES, c as formatUsd } from "./_ssr/types-ilZjrocH.mjs";
import { r as WEEKLY_CADENCE } from "./_ssr/catalog-CBLFz4-U.mjs";
import { t as Button } from "./_ssr/button-wmtQjre2.mjs";
import { i as useDeskStats, l as useLeads, t as useAccess } from "./_ssr/hooks-Mp7UKKeG.mjs";
import { t as UnlockButton } from "./_ssr/unlock-button-DmF_mbOq.mjs";
import { t as Skeleton } from "./_ssr/skeleton-WRz2gFUH.mjs";
import { n as isDue } from "./_ssr/select-CrGys0Hn.mjs";
import { t as Badge } from "./_ssr/badge-Dl6whbLK.mjs";
import { t as Card } from "./_ssr/card-B6UIYRVq.mjs";
import { n as NewLeadDialog, t as LeadCard } from "./_ssr/new-lead-dialog-B4kxW36F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-4byQByWO.js
var import_jsx_runtime = require_jsx_runtime();
function DeskPage() {
	const stats = useDeskStats();
	const leads = useLeads();
	const { data: access } = useAccess();
	const weekday = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "short" });
	const todayPlan = WEEKLY_CADENCE.find((d) => d.day === weekday) ?? WEEKLY_CADENCE[0];
	const due = (leads.data ?? []).filter((l) => isDue(l.followUpOn, l.stage));
	const live = (leads.data ?? []).filter((l) => l.stage !== "won" && l.stage !== "lost").slice(0, 6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.18em] text-steel uppercase",
				children: "Desk"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl leading-none md:text-5xl",
				children: "Today’s board"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/hunt",
						children: access?.canHunt === false ? "Hunt locked" : "Run a hunt"
					})
				}), access && !access.canSave ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockButton, { label: "Unlock $5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewLeadDialog, {})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid grid-cols-2 gap-3 md:grid-cols-4",
			children: stats.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-xl" })
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Open",
					value: String(stats.data?.openCount ?? 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Follow-ups due",
					value: String(stats.data?.dueCount ?? 0),
					hint: "today or overdue"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "In play",
					value: formatUsd(stats.data?.pipelineUsd ?? 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Booked",
					value: formatUsd(stats.data?.bookedUsd ?? 0),
					hint: `${stats.data?.bookedCount ?? 0} jobs`
				})
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-6 rounded-xl p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-subtle uppercase",
					children: todayPlan.day
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-2xl",
					children: todayPlan.focus
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm text-muted",
					children: todayPlan.move
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/playbook",
						children: "Open playbook"
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 flex flex-wrap gap-2",
			children: STAGES.map((stage) => {
				const count = stats.data?.byStage.find((s) => s.stage === stage.id)?.count ?? 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: stage.id === "won" ? "ok" : stage.id === "lost" ? "danger" : "muted",
					children: [
						stage.label,
						" ",
						count
					]
				}, stage.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: "Due now"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "link",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/board",
						children: "Full board"
					})
				})]
			}), leads.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-lg" })]
			}) : due.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Nothing due. Run a hunt or set a follow-up date on a live lead."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: due.map((lead) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadCard, { lead }, lead.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Live pipeline"
			}), leads.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-lg" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-lg" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-lg" })
				]
			}) : live.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Board is empty. Hunt a niche or add someone you already talk to."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: live.map((lead) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadCard, { lead }, lead.id))
			})]
		})
	] });
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "rounded-xl p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-wide text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-3xl tabular-nums leading-none",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-subtle",
				children: hint
			}) : null
		]
	});
}
//#endregion
export { DeskPage as component };
