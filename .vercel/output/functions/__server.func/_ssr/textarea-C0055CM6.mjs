import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn, t as Button } from "./button-wmtQjre2.mjs";
import { l as Check, o as ExternalLink, s as Copy } from "../_libs/lucide-react.mjs";
import { p as useThreadPeek } from "./hooks-Mp7UKKeG.mjs";
import { t as Badge } from "./badge-Dl6whbLK.mjs";
import { a as postLabel, n as displayUrl } from "./url-CfsaWNtp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/textarea-C0055CM6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SourcePost({ url, quote, className, compact = false, inspectable = false, onQuote }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const peek = useThreadPeek();
	if (!url) return null;
	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			setCopied(false);
		}
	}
	const result = peek.data && peek.data.ok ? peek.data.peek : null;
	const error = peek.data && !peek.data.ok ? peek.data.error : peek.error?.message;
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-w-0 items-center gap-1", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: url,
			target: "_blank",
			rel: "noreferrer noopener",
			title: url,
			className: "flex min-h-11 min-w-0 flex-1 items-center gap-1.5 text-steel hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
				className: "size-3.5 shrink-0",
				strokeWidth: 1.75
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate font-mono text-xs",
				children: displayUrl(url)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => void copyLink(),
			className: "inline-flex size-11 shrink-0 items-center justify-center text-steel hover:text-fg",
			"aria-label": copied ? "Copied" : "Copy link",
			children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" })
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("grid min-w-0 gap-2", className),
		children: [
			quote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"“",
					quote,
					"”"
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: url,
				target: "_blank",
				rel: "noreferrer noopener",
				title: url,
				className: "flex min-h-11 min-w-0 items-center gap-2 text-steel hover:text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
					className: "size-3.5 shrink-0",
					strokeWidth: 1.75
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate font-mono text-xs",
					children: displayUrl(url)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: url,
							target: "_blank",
							rel: "noreferrer noopener",
							children: postLabel(url)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						variant: "ghost",
						onClick: () => void copyLink(),
						children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), copied ? "Copied" : "Copy link"]
					}),
					inspectable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: "ghost",
						disabled: peek.isPending,
						onClick: () => peek.mutate(url, { onSuccess: (res) => {
							if (res.ok && res.peek.quote) onQuote?.(res.peek.quote);
						} }),
						children: peek.isPending ? "Reading thread" : "Check replies"
					}) : null
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-danger",
				children: error
			}) : null,
			result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 rounded-lg bg-elevated p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: result.stillOpen ? "ok" : "danger",
							children: result.stillOpen ? "Still open" : "Looks closed"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-subtle",
							children: [result.replies.length, " other replies"]
						})]
					}),
					result.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: result.note
					}) : null,
					result.replies.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: "No other replies found on this post."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-2",
						children: result.replies.map((reply, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium text-fg",
									children: reply.author
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: reply.text
								}),
								reply.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: reply.url,
									target: "_blank",
									rel: "noreferrer noopener",
									className: "mt-1 inline-flex min-h-11 items-center text-xs text-steel hover:text-fg",
									children: "Open this reply"
								}) : null
							]
						}, `${reply.author}-${index}`))
					})
				]
			}) : null
		]
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-xs font-medium tracking-wide text-muted", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-28 w-full rounded-md border border-border bg-elevated px-3 py-2.5 text-sm text-fg", "placeholder:text-subtle", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", "disabled:opacity-40", className),
		...props
	});
}
//#endregion
export { SourcePost as n, Textarea as r, Label as t };
