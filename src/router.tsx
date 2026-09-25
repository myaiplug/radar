import { createHashHistory, createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const pages = import.meta.env.BASE_URL === "/radar/";
  // Hash history needs window. The pages prerender runs on the server, so only
  // the browser build uses it. GitHub Pages then serves one shell at /radar/.
  const history = pages && typeof document !== "undefined" ? createHashHistory() : undefined;
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    ...(history ? { history } : {}),
  });
}
