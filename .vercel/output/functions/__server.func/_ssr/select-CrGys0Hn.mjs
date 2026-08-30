import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn } from "./button-wmtQjre2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/select-CrGys0Hn.js
var import_jsx_runtime = require_jsx_runtime();
function stageTone(stage) {
	switch (stage) {
		case "researching": return "steel";
		case "pitched": return "fg";
		case "negotiating": return "warn";
		case "won": return "ok";
		case "lost": return "danger";
		default: return "muted";
	}
}
function todayIso() {
	const d = /* @__PURE__ */ new Date();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${d.getFullYear()}-${m}-${day}`;
}
function isDue(date, stage) {
	if (!date) return false;
	if (stage === "won" || stage === "lost") return false;
	return date <= todayIso();
}
function Select({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn("h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", "disabled:opacity-40", className),
		...props
	});
}
//#endregion
export { isDue as n, stageTone as r, Select as t };
