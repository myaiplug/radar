import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as CATEGORIES } from "./types-ilZjrocH.mjs";
import { n as VOICE_NOTES, r as WEEKLY_CADENCE, t as CATALOG } from "./catalog-CBLFz4-U.mjs";
import { t as Button } from "./button-wmtQjre2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { f as useServices } from "./hooks-Mp7UKKeG.mjs";
import { t as Badge } from "./badge-Dl6whbLK.mjs";
import { t as Card } from "./card-B6UIYRVq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/playbook-D5xmKAH3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlaybookPage() {
	const { data: services = [] } = useServices();
	const [cat, setCat] = (0, import_react.useState)("audio");
	const slugs = new Set(services.filter((s) => s.active).map((s) => s.slug));
	const entries = CATALOG.filter((c) => c.category === cat);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.18em] text-steel uppercase",
			children: "Playbook"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 font-display text-4xl leading-none md:text-5xl",
			children: "Where the work lives"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 max-w-xl text-sm text-muted",
			children: "Copy the search. Post the sample. Do not spray a catalog."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Week"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-2 md:grid-cols-2",
				children: WEEKLY_CADENCE.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-lg p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-subtle",
							children: d.day
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-fg",
							children: d.focus
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: d.move
					})]
				}, d.day))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl",
				children: "Voice"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: VOICE_NOTES.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: note
				}, note))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setCat(c.id),
					className: `h-11 rounded-full px-3.5 text-sm ${cat === c.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted"}`,
					children: c.label
				}, c.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-4",
				children: entries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "rounded-xl p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-2xl",
									children: entry.name
								}),
								slugs.has(entry.slug) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "ok",
									children: "Hunting"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Paused" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-subtle",
									children: entry.rateLabel
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: entry.huntHint
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid gap-3",
							children: entry.places.map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium text-fg",
											children: place.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyQuery, { query: place.query })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-mono text-xs leading-relaxed break-all text-steel",
										children: place.query
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-subtle",
										children: place.note
									})
								]
							}, place.name))
						})
					]
				}, entry.slug))
			})]
		})
	] });
}
function CopyQuery({ query }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		size: "sm",
		variant: "ghost",
		className: "h-9 shrink-0",
		onClick: async () => {
			try {
				await navigator.clipboard.writeText(query);
				toast.success("Copied");
			} catch {
				toast.error("Could not copy");
			}
		},
		children: "Copy"
	});
}
//#endregion
export { PlaybookPage as component };
