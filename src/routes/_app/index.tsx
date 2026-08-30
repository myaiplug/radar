import { createFileRoute, Link } from "@tanstack/react-router";
import { WEEKLY_CADENCE } from "@/lib/radar/catalog";
import { useAccess, useDeskStats, useLeads } from "@/lib/radar/hooks";
import { STAGES, formatUsd } from "@/lib/radar/types";
import { isDue } from "@/lib/radar/ui";
import { LeadCard } from "@/components/lead-card";
import { NewLeadDialog } from "@/components/new-lead-dialog";
import { UnlockButton } from "@/components/unlock-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/")({ component: DeskPage });

function DeskPage() {
  const stats = useDeskStats();
  const leads = useLeads();
  const { data: access } = useAccess();
  const weekday = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const todayPlan = WEEKLY_CADENCE.find((d) => d.day === weekday) ?? WEEKLY_CADENCE[0];
  const due = (leads.data ?? []).filter((l) => isDue(l.followUpOn, l.stage));
  const live = (leads.data ?? []).filter((l) => l.stage !== "won" && l.stage !== "lost").slice(0, 6);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-steel uppercase">Desk</p>
          <h1 className="mt-2 font-display text-4xl leading-none md:text-5xl">Today’s board</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/hunt">{access?.canHunt === false ? "Hunt locked" : "Run a hunt"}</Link>
          </Button>
          {access && !access.canSave ? <UnlockButton label="Unlock $5" /> : <NewLeadDialog />}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.isLoading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : (
          <>
            <Stat label="Open" value={String(stats.data?.openCount ?? 0)} />
            <Stat label="Follow-ups due" value={String(stats.data?.dueCount ?? 0)} hint="today or overdue" />
            <Stat label="In play" value={formatUsd(stats.data?.pipelineUsd ?? 0)} />
            <Stat label="Booked" value={formatUsd(stats.data?.bookedUsd ?? 0)} hint={`${stats.data?.bookedCount ?? 0} jobs`} />
          </>
        )}
      </div>

      <Card className="mt-6 rounded-xl p-5">
        <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">{todayPlan.day}</p>
        <h2 className="mt-1 font-display text-2xl">{todayPlan.focus}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{todayPlan.move}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/playbook">Open playbook</Link>
        </Button>
      </Card>

      <div className="mt-8 flex flex-wrap gap-2">
        {STAGES.map((stage) => {
          const count = stats.data?.byStage.find((s) => s.stage === stage.id)?.count ?? 0;
          return (
            <Badge key={stage.id} tone={stage.id === "won" ? "ok" : stage.id === "lost" ? "danger" : "muted"}>
              {stage.label} {count}
            </Badge>
          );
        })}
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">Due now</h2>
          <Button asChild variant="link" size="sm">
            <Link to="/board">Full board</Link>
          </Button>
        </div>
        {leads.isLoading ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </div>
        ) : due.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Nothing due. Run a hunt or set a follow-up date on a live lead.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {due.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">Live pipeline</h2>
        {leads.isLoading ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </div>
        ) : live.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Board is empty. Hunt a niche or add someone you already talk to.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="rounded-xl p-4">
      <p className="text-xs tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums leading-none">{value}</p>
      {hint ? <p className="mt-2 text-xs text-subtle">{hint}</p> : null}
    </Card>
  );
}
