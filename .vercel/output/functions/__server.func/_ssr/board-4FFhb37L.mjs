import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as STAGES } from "./types-ilZjrocH.mjs";
import { t as Button } from "./button-wmtQjre2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as useLeadMutations, f as useServices, l as useLeads, t as useAccess } from "./hooks-Mp7UKKeG.mjs";
import { t as UnlockButton } from "./unlock-button-DmF_mbOq.mjs";
import { t as Skeleton } from "./skeleton-WRz2gFUH.mjs";
import { t as Select } from "./select-CrGys0Hn.mjs";
import { n as NewLeadDialog, t as LeadCard } from "./new-lead-dialog-B4kxW36F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/board-4FFhb37L.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BoardPage() {
	const leads = useLeads();
	const { data: access } = useAccess();
	const { data: services = [] } = useServices();
	const { stage } = useLeadMutations();
	const [serviceFilter, setServiceFilter] = (0, import_react.useState)("all");
	const [mobileStage, setMobileStage] = (0, import_react.useState)("new");
	const filtered = (0, import_react.useMemo)(() => {
		const list = leads.data ?? [];
		if (serviceFilter === "all") return list;
		if (serviceFilter === "none") return list.filter((l) => l.serviceId == null);
		const id = Number(serviceFilter);
		return list.filter((l) => l.serviceId === id);
	}, [leads.data, serviceFilter]);
	function move(id, next) {
		stage.mutate({
			id,
			stage: next
		}, { onError: (err) => toast.error(err.message) });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.18em] text-steel uppercase",
			children: "Board"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 font-display text-4xl leading-none md:text-5xl",
			children: "Pipeline"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2 sm:flex-row sm:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: serviceFilter,
				onChange: (e) => setServiceFilter(e.target.value),
				className: "sm:w-52",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "all",
						children: "All offers"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "none",
						children: "Unassigned"
					}),
					services.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: s.id,
						children: s.name
					}, s.id))
				]
			}), access && !access.canSave ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockButton, { label: "Unlock to add $5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewLeadDialog, {})]
		})]
	}), leads.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 grid gap-3 md:grid-cols-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })
		]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 flex gap-2 overflow-x-auto pb-2 md:hidden",
			children: STAGES.map((s) => {
				const count = filtered.filter((l) => l.stage === s.id).length;
				const on = mobileStage === s.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMobileStage(s.id),
					className: `h-11 shrink-0 rounded-full px-3.5 text-sm ${on ? "bg-accent text-accent-fg" : "bg-elevated text-muted"}`,
					children: [
						s.label,
						" ",
						count
					]
				}, s.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageColumn, {
				stage: mobileStage,
				leads: filtered.filter((l) => l.stage === mobileStage),
				onMove: move
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 hidden gap-3 overflow-x-auto pb-4 md:flex",
			children: STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-[220px] shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageColumn, {
					stage: s.id,
					leads: filtered.filter((l) => l.stage === s.id),
					onMove: move
				})
			}, s.id))
		})
	] })] });
}
function StageColumn({ stage, leads, onMove }) {
	const meta = STAGES.find((s) => s.id === stage);
	const list = leads ?? [];
	const idx = STAGES.findIndex((s) => s.id === stage);
	const prev = idx > 0 ? STAGES[idx - 1].id : null;
	const next = idx < STAGES.length - 1 ? STAGES[idx + 1].id : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3 flex items-baseline justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-sm font-medium text-fg",
			children: meta.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs tabular-nums text-subtle",
			children: list.length
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-2",
		children: list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded-lg bg-surface px-3 py-6 text-center text-xs text-subtle",
			children: meta.hint
		}) : list.map((lead) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadCard, { lead }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1",
				children: [prev ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					className: "h-9 flex-1 text-[11px]",
					onClick: () => onMove(lead.id, prev),
					children: "Back"
				}) : null, next ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					className: "h-9 flex-1 text-[11px]",
					onClick: () => onMove(lead.id, next),
					children: "Forward"
				}) : null]
			})]
		}, lead.id))
	})] });
}
//#endregion
export { BoardPage as component };
