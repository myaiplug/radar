import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { UnlockCard } from "@/components/unlock-card";
import { Button } from "@/components/ui/button";
import { useAccess, useConfirmCheckout } from "@/lib/radar/hooks";

export const Route = createFileRoute("/_app/unlock")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : "",
  }),
  component: UnlockPage,
});

function UnlockPage() {
  const { session_id: sessionId } = Route.useSearch();
  const access = useAccess();
  const confirm = useConfirmCheckout();
  const ran = useRef(false);

  useEffect(() => {
    if (!sessionId || ran.current) return;
    ran.current = true;
    confirm.mutate(
      { sessionId },
      {
        onSuccess: (res) => {
          if (!res.ok) toast.error(res.error);
          else toast.success("Desk unlocked");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }, [sessionId, confirm]);

  const unlocked = access.data?.plan === "unlocked";

  return (
    <div>
      <p className="text-xs font-medium tracking-[0.18em] text-steel uppercase">Access</p>
      <h1 className="mt-2 font-display text-4xl leading-none md:text-5xl">
        {unlocked ? "Desk is open" : "Keep the desk"}
      </h1>
      {confirm.isPending ? (
        <p className="mt-4 text-sm text-muted">Confirming payment.</p>
      ) : null}
      {unlocked ? (
        <div className="mt-6">
          <p className="max-w-xl text-sm text-muted">
            Lifetime access is on. Hunts stay open. Leads stay on the board with the post URL attached.
          </p>
          <Button asChild className="mt-5">
            <Link to="/">Back to the desk</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 max-w-xl">
          <UnlockCard />
        </div>
      )}
    </div>
  );
}
