import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as CATEGORIES } from "./types-ilZjrocH.mjs";
import { t as CATALOG } from "./catalog-CBLFz4-U.mjs";
import { t as Button } from "./button-wmtQjre2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as useServiceMutation, f as useServices } from "./hooks-Mp7UKKeG.mjs";
import { t as Skeleton } from "./skeleton-WRz2gFUH.mjs";
import { t as Badge } from "./badge-Dl6whbLK.mjs";
import { t as Card } from "./card-B6UIYRVq.mjs";
import { t as Input } from "./input-C5tgmFWE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/offers-Big9RBzK.js
var import_jsx_runtime = require_jsx_runtime();
function OffersPage() {
	const { data: services = [], isLoading } = useServices();
	const mutate = useServiceMutation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.18em] text-steel uppercase",
			children: "Offers"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 font-display text-4xl leading-none md:text-5xl",
			children: "What you sell"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 max-w-xl text-sm text-muted",
			children: "Toggle what you are hunting this week. Edit the rate so pitches stay honest."
		}),
		isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-3 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })]
		}) : CATEGORIES.map((cat) => {
			const items = services.filter((s) => s.category === cat.id);
			if (items.length === 0) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-medium tracking-[0.16em] text-subtle uppercase",
					children: cat.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid gap-3 md:grid-cols-2",
					children: items.map((s) => {
						const extra = CATALOG.find((c) => c.slug === s.slug);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "rounded-xl p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-medium text-fg",
										children: s.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: s.blurb
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: s.active ? "ok" : "muted",
										children: s.active ? "On" : "Off"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-col gap-2 sm:flex-row sm:items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										defaultValue: s.rateLabel,
										"aria-label": `${s.name} rate`,
										className: "sm:max-w-40",
										onBlur: (e) => {
											const next = e.target.value.trim();
											if (next && next !== s.rateLabel) mutate.mutate({
												id: s.id,
												rateLabel: next
											}, { onError: (err) => toast.error(err.message) });
										}
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										size: "sm",
										variant: s.active ? "outline" : "secondary",
										onClick: () => mutate.mutate({
											id: s.id,
											active: !s.active
										}, { onError: (err) => toast.error(err.message) }),
										children: s.active ? "Pause" : "Activate"
									})]
								}),
								extra ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-subtle",
									children: extra.huntHint
								}) : null
							]
						}, s.id);
					})
				})]
			}, cat.id);
		})
	] });
}
//#endregion
export { OffersPage as component };
