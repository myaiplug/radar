import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Button } from "./button-wmtQjre2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useCheckout } from "./hooks-Mp7UKKeG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/unlock-button-DmF_mbOq.js
var import_jsx_runtime = require_jsx_runtime();
function UnlockButton({ label = "Unlock $5", variant = "default", size = "default", className }) {
	const checkout = useCheckout();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant,
		size,
		className,
		disabled: checkout.isPending,
		onClick: () => {
			checkout.mutate(void 0, {
				onSuccess: (res) => {
					if (res.ok && "url" in res && res.url) {
						window.open(res.url, "_blank", "noopener,noreferrer");
						return;
					}
					if (res.ok && "unlocked" in res && res.unlocked) {
						toast.success("Desk unlocked");
						return;
					}
					if (!res.ok) toast.error(res.error);
				},
				onError: (err) => toast.error(err.message)
			});
		},
		children: checkout.isPending ? "Opening checkout" : label
	});
}
//#endregion
export { UnlockButton as t };
