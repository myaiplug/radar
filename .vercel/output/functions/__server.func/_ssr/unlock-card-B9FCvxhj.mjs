import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as UnlockButton } from "./unlock-button-DmF_mbOq.mjs";
import { t as Card } from "./card-B6UIYRVq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/unlock-card-B9FCvxhj.js
var import_jsx_runtime = require_jsx_runtime();
function UnlockCard({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "rounded-xl p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.18em] text-steel uppercase",
				children: "Full desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-3xl leading-none",
				children: title ?? "Keep the names"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm text-muted",
				children: body ?? "Two leads on the free desk. They go dark in 48 hours. $5 once keeps every post, every hunt, and the pitch writer."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockButton, {
				className: "mt-5",
				label: "Unlock $5"
			})
		]
	});
}
//#endregion
export { UnlockCard as t };
