import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { BookOpen, Compass, LayoutGrid, Radar, Rows3 } from "lucide-react";
import { authEnabled, signOut } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";
import { RadarMark } from "./radar-mark";
import { TeaseBar } from "./tease-bar";
import { Skeleton } from "./ui/skeleton";

const NAV = [
  { to: "/", label: "Desk", icon: Radar },
  { to: "/hunt", label: "Hunt", icon: Compass },
  { to: "/board", label: "Board", icon: Rows3 },
  { to: "/offers", label: "Offers", icon: LayoutGrid },
  { to: "/playbook", label: "Playbook", icon: BookOpen },
] as const;

function navActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <aside className="fixed top-0 left-0 z-30 hidden h-dvh w-56 flex-col border-r border-border bg-bg md:flex">
        <Link to="/" className="flex items-center gap-2.5 px-5 pt-6 pb-8">
          <RadarMark className="text-accent" />
          <span className="font-display text-2xl leading-none tracking-tight">Radar</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = navActive(pathname, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150",
                  active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/60 hover:text-fg",
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border px-4 py-4">
          {isPending ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <div className="[&_button]:text-muted [&_img]:size-7 [&_span]:text-xs">
              <UserButton />
            </div>
          )}
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg/95 px-4 backdrop-blur md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <RadarMark className="size-6 text-accent" />
          <span className="font-display text-xl leading-none">Radar</span>
        </Link>
        {isPending ? (
          <Skeleton className="size-8 rounded-full" />
        ) : user && authEnabled ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className="h-11 px-2 text-xs text-muted"
          >
            Sign out
          </button>
        ) : null}
      </header>

      <main className="md:pl-56">
        <TeaseBar />
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-24 md:px-8 md:pt-8 md:pb-12">
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = navActive(pathname, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-xs tracking-wide",
                  active ? "text-fg" : "text-subtle",
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
