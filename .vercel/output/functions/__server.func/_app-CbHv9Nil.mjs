import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as useRouterState, m as Outlet, v as Link, y as Navigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { s as formatHold, t as CATEGORIES } from "./_ssr/types-ilZjrocH.mjs";
import { t as CATALOG } from "./_ssr/catalog-CBLFz4-U.mjs";
import { n as cn, t as Button } from "./_ssr/button-wmtQjre2.mjs";
import { a as LayoutGrid, c as Compass, i as Radar, r as Rows3, u as BookOpen } from "./_libs/lucide-react.mjs";
import { o as Route$10 } from "./_ssr/router-Dd7I69Cm.mjs";
import { t as useAccess } from "./_ssr/hooks-Mp7UKKeG.mjs";
import { t as UnlockButton } from "./_ssr/unlock-button-DmF_mbOq.mjs";
import { t as Skeleton } from "./_ssr/skeleton-WRz2gFUH.mjs";
import { i as signOut } from "./_ssr/client-sGid3STf.mjs";
import { n as useCurrentUser, r as useCurrentUserState, t as RadarMark } from "./_ssr/radar-mark-StXi2l92.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-CbHv9Nil.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* Auth is ON by default (including the sandbox live preview, which does real
* sign-in). Visitors are signed out until they authenticate. The shared dev
* user only appears when auth is explicitly disabled (`VITE_AUTH_ENABLED=false`).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void signOut(),
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline",
				children: "Sign out"
			})
		]
	});
}
function TeaseBar() {
	const { data: access } = useAccess();
	const [now, setNow] = (0, import_react.useState)(Date.now());
	(0, import_react.useEffect)(() => {
		if (!access || access.plan === "unlocked" || !access.holdEndsAt) return;
		const id = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(id);
	}, [access]);
	if (!access || access.plan === "unlocked") return null;
	const left = access.holdEndsAt ? Math.max(0, Date.parse(access.holdEndsAt) - now) : null;
	const dark = access.dark || left !== null && left <= 0;
	let copy = "First hunt is free. Two leads held 48 hours. Then they go dark.";
	if (dark) copy = "Your leads went dark. $5 brings the posts and contacts back.";
	else if (left !== null) copy = `${access.savedCount} name${access.savedCount === 1 ? "" : "s"} on the clock · dark in ${formatHold(left)}`;
	else if (access.huntsUsed > 0) copy = "Free hunt is spent. Park 2 leads before they walk.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-border bg-elevated",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg",
				children: copy
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlockButton, {
				size: "sm",
				label: dark ? "Bring them back $5" : "Keep them $5"
			})]
		})
	});
}
var NAV = [
	{
		to: "/",
		label: "Desk",
		icon: Radar
	},
	{
		to: "/hunt",
		label: "Hunt",
		icon: Compass
	},
	{
		to: "/board",
		label: "Board",
		icon: Rows3
	},
	{
		to: "/offers",
		label: "Offers",
		icon: LayoutGrid
	},
	{
		to: "/playbook",
		label: "Playbook",
		icon: BookOpen
	}
];
function navActive(pathname, to) {
	if (to === "/") return pathname === "/";
	return pathname === to || pathname.startsWith(`${to}/`);
}
function AppShell() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { user, isPending } = useCurrentUserState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed top-0 left-0 z-30 hidden h-dvh w-56 flex-col border-r border-border bg-bg md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2.5 px-5 pt-6 pb-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadarMark, { className: "text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-2xl leading-none tracking-tight",
							children: "Radar"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-1 px-3",
						children: NAV.map((item) => {
							const active = navActive(pathname, item.to);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150", active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/60 hover:text-fg"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-4",
									strokeWidth: 1.75
								}), item.label]
							}, item.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border px-4 py-4",
						children: isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-full" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "[&_button]:text-muted [&_img]:size-7 [&_span]:text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg/95 px-4 backdrop-blur md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadarMark, { className: "size-6 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl leading-none",
						children: "Radar"
					})]
				}), isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-8 rounded-full" }) : user && true ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void signOut(),
					className: "h-11 px-2 text-xs text-muted",
					children: "Sign out"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "md:pl-56",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeaseBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto w-full max-w-6xl px-4 pt-6 pb-24 md:px-8 md:pt-8 md:pb-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-5",
					children: NAV.map((item) => {
						const active = navActive(pathname, item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-xs tracking-wide", active ? "text-fg" : "text-subtle"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-4",
								strokeWidth: 1.75
							}), item.label]
						}, item.to);
					})
				})
			})
		]
	});
}
var STEPS = [
	{
		n: "01",
		title: "Hunt free",
		body: "One live hunt. Real posts with the permalink so you can prove the ask and read the thread."
	},
	{
		n: "02",
		title: "Two leads held",
		body: "Park two names on the board. 48 hours. Then they go dark: posts, contacts, the lot."
	},
	{
		n: "03",
		title: "Unlock $5",
		body: "Once. Keep every lead. Hunt without a cap. Pitch writer opens. No subscription."
	}
];
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadarMark, { className: "text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-2xl leading-none",
						children: "Radar"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: "Sign in"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto w-full max-w-6xl px-5 pt-10 pb-12 md:px-8 md:pt-16 md:pb-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.18em] text-steel uppercase",
						children: "Personal freelance desk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-4 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-fg md:text-7xl",
						children: [
							"Find the work.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Keep the work."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-xl text-base text-muted md:text-lg",
						children: "Hunt a niche. Get live posts. Save two leads free. They go dark in 48 hours unless you unlock the desk for $5."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								children: "Hunt free"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								children: "Unlock $5"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 max-w-2xl text-sm leading-relaxed text-subtle",
						children: "Beats, mix, stems, screw, repair, LUFS, covers, graphics, motion, video, ghost writing, web, vibe coding, agents."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-y border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-3 md:px-8 md:py-16",
					children: STEPS.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-subtle",
							children: step.n
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-display text-3xl",
							children: step.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-muted",
							children: step.body
						})
					] }, step.n))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.18em] text-steel uppercase",
						children: "Price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-4xl md:text-5xl",
						children: "$5 once."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-xl text-sm text-muted md:text-base",
						children: "No monthly. The free tease is supposed to sting. You find real names, you feel them slipping, you keep them."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-8 grid gap-3 text-sm text-fg md:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rounded-lg bg-surface px-4 py-3",
								children: "Live post URL on every lead"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rounded-lg bg-surface px-4 py-3",
								children: "Unlimited hunts after unlock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rounded-lg bg-surface px-4 py-3",
								children: "Board, follow-ups, dollar value"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rounded-lg bg-surface px-4 py-3",
								children: "DM / email / proposal writer"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						className: "mt-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							children: "Start the free hunt"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "offers",
				className: "mx-auto w-full max-w-6xl px-5 pb-16 md:px-8 md:pb-24",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.18em] text-steel uppercase",
						children: "Built around your stack"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-4xl md:text-5xl",
						children: "Fifteen offers. One board."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-2xl text-sm text-muted md:text-base",
						children: "Beats, mix, stems, screw mixes, repair, LUFS, covers, motion, video, ghost writing, sites, vibe coding, agents. Radar hunts per skill so you are not spraying one generic pitch."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4",
						children: CATEGORIES.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs font-medium tracking-[0.16em] text-subtle uppercase",
							children: cat.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2",
							children: CATALOG.filter((s) => s.category === cat.id).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "text-sm text-fg",
								children: [s.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-xs text-subtle",
									children: s.rateLabel
								})]
							}, s.slug))
						})] }, cat.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-xs text-subtle md:flex-row md:items-center md:justify-between md:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Radar · $5 lifetime desk" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Built by bZ in Louisville, KY" })]
				})
			})
		]
	});
}
function PageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-4 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-xl" })
			]
		})]
	});
}
function AppLayout() {
	const { sessionUser } = Route$10.useRouteContext();
	const { user, isPending } = useCurrentUserState();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const signedIn = Boolean(user || isPending && sessionUser);
	if (pathname === "/" && !signedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, {});
	if (isPending && !signedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {});
	if (!signedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { AppLayout as component };
