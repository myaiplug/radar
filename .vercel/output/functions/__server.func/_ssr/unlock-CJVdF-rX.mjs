import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Button } from "./button-wmtQjre2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Route$3 } from "./router-Dd7I69Cm.mjs";
import { r as useConfirmCheckout, t as useAccess } from "./hooks-Mp7UKKeG.mjs";
import { t as UnlockCard } from "./unlock-card-B9FCvxhj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/unlock-CJVdF-rX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UnlockPage() {
	const { session_id: sessionId } = Route$3.useSearch();
	const access = useAccess();
	const confirm = useConfirmCheckout();
	const ran = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!sessionId || ran.current) return;
		ran.current = true;
		confirm.mutate({ sessionId }, {
			onSuccess: (res) => {
				if (!res.ok) toast.error(res.error);
				else toast.success("Desk unlocked");
			},
			onError: (err) => toast.error(err.message)
		});
	}, [sessionId, confirm]);
	const unlocked = access.data?.plan === "unlocked";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.18em] text-steel uppercase",
			children: "Access"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 font-display text-4xl leading-none md:text-5xl",
			children: unlocked ? "Desk is open" : "Keep the desk"
		}),
		confirm.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-muted",
			children: "Confirming payment."
		}) : null,
		unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xl text-sm text-muted",
				children: "Lifetime access is on. Hunts stay open. Leads stay on the board with the post URL attached."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "Back to the desk"
				})
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 max-w-xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockCard, {})
		})
	] });
}
//#endregion
export { UnlockPage as component };
