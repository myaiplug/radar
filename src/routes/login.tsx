import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RadarMark } from "@/components/radar-mark";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6">
        <Skeleton className="h-64 w-full max-w-sm rounded-xl" />
      </main>
    );
  }
  if (user) return <Navigate to="/" />;

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 text-fg">
          <RadarMark className="text-accent" />
          <span className="font-display text-2xl leading-none">Radar</span>
        </Link>
        <h1 className="mt-8 font-display text-4xl leading-tight">Sign in to the desk</h1>
        <p className="mt-3 text-sm text-muted">
          First hunt is free. Live posts from the last 48 hours. Two leads held. $5 keeps them.
        </p>
        <div className="mt-8 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => void signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
      </div>
    </main>
  );
}
