import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { Landing } from "@/components/landing";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Skeleton } from "@/components/ui/skeleton";

const fetchSessionUser = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const u = await getSessionUser();
  return u ? { id: u.id } : null;
});

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
  component: AppLayout,
});

function PageSkeleton() {
  return (
    <div className="min-h-dvh bg-bg p-6">
      <Skeleton className="h-10 w-40" />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}

function AppLayout() {
  const { sessionUser } = Route.useRouteContext();
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signedIn = Boolean(user || (isPending && sessionUser));

  if (pathname === "/" && !signedIn) {
    return <Landing />;
  }

  if (isPending && !signedIn) {
    return <PageSkeleton />;
  }

  if (!signedIn) {
    return <RedirectToSignIn />;
  }

  return <AppShell />;
}
