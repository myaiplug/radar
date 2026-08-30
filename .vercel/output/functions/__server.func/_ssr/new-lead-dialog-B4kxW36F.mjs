import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as STAGES, c as formatUsd, i as SOURCES, u as sourceLabel } from "./types-ilZjrocH.mjs";
import { n as cn, t as Button } from "./button-wmtQjre2.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as useLeadMutations, f as useServices, t as useAccess } from "./hooks-Mp7UKKeG.mjs";
import { n as isDue, r as stageTone, t as Select } from "./select-CrGys0Hn.mjs";
import { t as Badge } from "./badge-Dl6whbLK.mjs";
import { t as Card } from "./card-B6UIYRVq.mjs";
import { n as SourcePost, r as Textarea, t as Label } from "./textarea-C0055CM6.mjs";
import { t as Input } from "./input-C5tgmFWE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-lead-dialog-B4kxW36F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LeadCard({ lead }) {
	const due = isDue(lead.followUpOn, lead.stage);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/leads/$id",
			params: { id: String(lead.id) },
			className: "block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "rounded-lg p-3 transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.16)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium text-fg",
								children: lead.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted",
								children: lead.company || lead.roleTitle || sourceLabel(lead.source)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: lead.locked ? "danger" : stageTone(lead.stage),
							children: lead.score
						})]
					}),
					lead.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-warn",
						children: "Went dark. Unlock to bring the post back."
					}) : lead.postQuote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 line-clamp-2 text-xs text-muted",
						children: [
							"“",
							lead.postQuote,
							"”"
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between gap-2 text-xs text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: lead.serviceName ?? "Unassigned"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: formatUsd(lead.valueUsd)
						})]
					}),
					due && !lead.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-warn",
						children: ["Follow up ", lead.followUpOn]
					}) : !lead.locked && lead.nextAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 truncate text-xs text-muted",
						children: lead.nextAction
					}) : null
				]
			})
		}), !lead.locked && lead.postUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourcePost, {
			url: lead.postUrl,
			compact: true,
			className: "px-1"
		}) : null]
	});
}
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2", "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]", "data-[state=open]:animate-in data-[state=closed]:animate-out", "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 grid size-11 place-items-center rounded-md text-muted hover:bg-elevated hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-2xl leading-tight text-fg", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("mt-1 text-sm text-muted", className),
		...props
	});
}
function NewLeadDialog({ triggerLabel = "New lead" }) {
	const { data: services = [] } = useServices();
	const { data: access } = useAccess();
	const { create } = useLeadMutations();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [company, setCompany] = (0, import_react.useState)("");
	const [contact, setContact] = (0, import_react.useState)("");
	const [postUrl, setPostUrl] = (0, import_react.useState)("");
	const [source, setSource] = (0, import_react.useState)("manual");
	const [serviceId, setServiceId] = (0, import_react.useState)("");
	const [valueUsd, setValueUsd] = (0, import_react.useState)("");
	const [why, setWhy] = (0, import_react.useState)("");
	function reset() {
		setName("");
		setCompany("");
		setContact("");
		setPostUrl("");
		setSource("manual");
		setServiceId("");
		setValueUsd("");
		setWhy("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: triggerLabel })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New lead" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Park a name on the board. You can flesh it out later." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-5 grid gap-3",
				onSubmit: (e) => {
					e.preventDefault();
					if (!name.trim()) return;
					if (access && !access.canSave) {
						toast.error("Free desk holds 2 leads. Unlock $5 to keep more.");
						return;
					}
					create.mutate({
						name,
						company,
						contact,
						postUrl,
						source,
						serviceId: serviceId ? Number(serviceId) : null,
						valueUsd: Number(valueUsd) || 0,
						why,
						stage: STAGES[0].id
					}, {
						onSuccess: () => {
							toast.success("Lead saved");
							reset();
							setOpen(false);
						},
						onError: (err) => toast.error(err.message)
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "lead-name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "lead-name",
							value: name,
							onChange: (e) => setName(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "lead-company",
								children: "Company / act"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "lead-company",
								value: company,
								onChange: (e) => setCompany(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "lead-contact",
								children: "Handle or link"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "lead-contact",
								value: contact,
								onChange: (e) => setContact(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "lead-post",
								children: "Source post URL"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "lead-post",
								type: "url",
								inputMode: "url",
								placeholder: "https://x.com/.../status/...",
								value: postUrl,
								onChange: (e) => setPostUrl(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: "Direct permalink. You will open it to read replies before pitching."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "lead-source",
									children: "Source"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									id: "lead-source",
									value: source,
									onChange: (e) => setSource(e.target.value),
									children: SOURCES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: s.id,
										children: s.label
									}, s.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "lead-service",
									children: "Offer"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									id: "lead-service",
									value: serviceId,
									onChange: (e) => setServiceId(e.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Unassigned"
									}), services.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: s.id,
										children: s.name
									}, s.id))]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "lead-value",
									children: "Value USD"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "lead-value",
									inputMode: "numeric",
									value: valueUsd,
									onChange: (e) => setValueUsd(e.target.value)
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "lead-why",
							children: "Why they might buy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "lead-why",
							value: why,
							onChange: (e) => setWhy(e.target.value),
							className: "min-h-20"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: create.isPending || !name.trim(),
							children: create.isPending ? "Saving" : "Save lead"
						})]
					})
				]
			})
		] })]
	});
}
//#endregion
export { NewLeadDialog as n, LeadCard as t };
