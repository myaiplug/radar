import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as formatUsd, t as CATEGORIES, u as sourceLabel } from "./types-ilZjrocH.mjs";
import { t as Button } from "./button-wmtQjre2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as useLeadMutations, f as useServices, o as useHunt, t as useAccess } from "./hooks-Mp7UKKeG.mjs";
import { t as UnlockButton } from "./unlock-button-DmF_mbOq.mjs";
import { t as Badge } from "./badge-Dl6whbLK.mjs";
import { t as Card } from "./card-B6UIYRVq.mjs";
import { n as SourcePost, r as Textarea, t as Label } from "./textarea-C0055CM6.mjs";
import { t as Input } from "./input-C5tgmFWE.mjs";
import { t as UnlockCard } from "./unlock-card-B9FCvxhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hunt-SJkECChS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HuntPage() {
	const { data: services = [], isLoading } = useServices();
	const { data: access } = useAccess();
	const hunt = useHunt();
	const { create } = useLeadMutations();
	const [selected, setSelected] = (0, import_react.useState)([]);
	const [niche, setNiche] = (0, import_react.useState)("independent artists and small labels");
	const [geo, setGeo] = (0, import_react.useState)("Louisville, KY plus remote US");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [saved, setSaved] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const prospects = hunt.data?.ok ? hunt.data.prospects : [];
	const error = hunt.data && !hunt.data.ok ? hunt.data.error : hunt.error?.message;
	const unlocked = access?.plan === "unlocked";
	const canHunt = access?.canHunt ?? true;
	const savesLeft = access?.savesLeft ?? 2;
	function toggle(id) {
		setSelected((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
	}
	function saveProspect(p) {
		if (!unlocked && savesLeft <= 0) {
			toast.error("Free desk holds 2 leads. Unlock $5 to keep the rest.");
			return;
		}
		const key = p.postUrl || `${p.name}|${p.contact}`;
		create.mutate({
			name: p.name,
			company: p.company,
			roleTitle: p.role,
			contact: p.contact,
			source: p.source === "other" ? "hunt" : p.source,
			serviceId: selected[0] ?? services.find((s) => s.active)?.id ?? null,
			valueUsd: p.estimatedValue,
			score: p.score,
			why: p.why,
			angle: p.angle,
			nextAction: p.nextAction,
			postUrl: p.postUrl,
			postQuote: p.postQuote,
			stage: "new"
		}, {
			onSuccess: () => {
				setSaved((cur) => new Set(cur).add(key));
				toast.success(`Saved ${p.name}`);
			},
			onError: (err) => toast.error(err.message)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.18em] text-steel uppercase",
			children: "Hunt"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 font-display text-4xl leading-none md:text-5xl",
			children: "Name the room"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 max-w-xl text-sm text-muted",
			children: unlocked ? "Pick the offer, the niche, the city. Every hit comes with the live post URL." : "One free hunt. Live post links so you can prove it. Park 2 names. The rest walk if you leave."
		}),
		!canHunt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 max-w-xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockCard, {
				title: "Hunt is locked",
				body: "That was the tease. $5 opens unlimited hunts and keeps every lead you already parked."
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-8 grid gap-6",
			onSubmit: (e) => {
				e.preventDefault();
				setSaved(/* @__PURE__ */ new Set());
				hunt.mutate({
					serviceIds: selected,
					niche,
					geo,
					notes
				}, { onError: (err) => toast.error(err.message) });
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Offers to hunt" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: isLoading ? null : CATEGORIES.map((cat) => services.filter((s) => s.category === cat.id && s.active).map((s) => {
							const on = selected.includes(s.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => toggle(s.id),
								className: `h-11 rounded-full px-3.5 text-sm transition-colors duration-150 ${on ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"}`,
								children: s.name
							}, s.id);
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-subtle",
						children: "Leave empty to hunt your top four active offers."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "niche",
							children: "Niche"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "niche",
							value: niche,
							onChange: (e) => setNiche(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "geo",
							children: "Geography"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "geo",
							value: geo,
							onChange: (e) => setGeo(e.target.value)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "notes",
						children: "Extra brief"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "notes",
						className: "min-h-20",
						placeholder: "Example: artists dropping this month, studios that still mix in the box, venues with ugly flyers",
						value: notes,
						onChange: (e) => setNotes(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: hunt.isPending,
					children: hunt.isPending ? "Hunting" : unlocked ? "Run hunt" : "Run free hunt"
				}) })
			]
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-danger",
			children: error
		}) : null,
		prospects.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-3xl",
						children: [prospects.length, " prospects"]
					}), !unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-warn",
						children: [
							savesLeft,
							" save slot",
							savesLeft === 1 ? "" : "s",
							" left. Leave this page and the rest are gone."
						]
					}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "link",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/board",
							children: "Open board"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3 md:grid-cols-2",
					children: prospects.map((p) => {
						const key = p.postUrl || `${p.name}|${p.contact}`;
						const isSaved = saved.has(key);
						const blocked = !isSaved && !unlocked && savesLeft <= 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "rounded-xl p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-fg",
											children: p.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted",
											children: [p.role, p.company].filter(Boolean).join(" · ") || sourceLabel(p.source)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: "steel",
										children: p.score
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-fg",
									children: p.why
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: p.angle
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-xs text-subtle",
									children: [
										p.contact || sourceLabel(p.source),
										" · ",
										p.nextAction,
										" · ",
										formatUsd(p.estimatedValue)
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourcePost, {
									url: p.postUrl,
									quote: p.postQuote,
									inspectable: unlocked,
									className: "mt-4"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4",
									children: blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockButton, {
										size: "sm",
										label: "Unlock to save $5"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: isSaved ? "outline" : "default",
										disabled: isSaved || create.isPending,
										onClick: () => saveProspect(p),
										children: isSaved ? "Saved" : "Save to board"
									})
								})
							]
						}, key);
					})
				}),
				!unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 max-w-xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockCard, {
						title: "Don't let them walk",
						body: "You just found live work. Two names fit on the free desk. $5 keeps the rest and starts the 48 hour clock from going dark."
					})
				}) : null
			]
		}) : null
	] });
}
//#endregion
export { HuntPage as component };
