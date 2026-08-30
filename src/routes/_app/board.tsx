import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { LeadCard } from "@/components/lead-card";
import { NewLeadDialog } from "@/components/new-lead-dialog";
import { UnlockButton } from "@/components/unlock-button";
import { useAccess, useLeadMutations, useLeads, useServices } from "@/lib/radar/hooks";
import { STAGES, type StageId } from "@/lib/radar/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/board")({ component: BoardPage });

function BoardPage() {
  const leads = useLeads();
  const { data: access } = useAccess();
  const { data: services = [] } = useServices();
  const { stage } = useLeadMutations();
  const [serviceFilter, setServiceFilter] = useState("all");
  const [mobileStage, setMobileStage] = useState<StageId>("new");

  const filtered = useMemo(() => {
    const list = leads.data ?? [];
    if (serviceFilter === "all") return list;
    if (serviceFilter === "none") return list.filter((l) => l.serviceId == null);
    const id = Number(serviceFilter);
    return list.filter((l) => l.serviceId === id);
  }, [leads.data, serviceFilter]);

  function move(id: number, next: StageId) {
    stage.mutate(
      { id, stage: next },
      { onError: (err) => toast.error(err.message) },
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-steel uppercase">Board</p>
          <h1 className="mt-2 font-display text-4xl leading-none md:text-5xl">Pipeline</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="sm:w-52"
          >
            <option value="all">All offers</option>
            <option value="none">Unassigned</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          {access && !access.canSave ? <UnlockButton label="Unlock to add $5" /> : <NewLeadDialog />}
        </div>
      </div>

      {leads.isLoading ? (
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 md:hidden">
            {STAGES.map((s) => {
              const count = filtered.filter((l) => l.stage === s.id).length;
              const on = mobileStage === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setMobileStage(s.id)}
                  className={`h-11 shrink-0 rounded-full px-3.5 text-sm ${
                    on ? "bg-accent text-accent-fg" : "bg-elevated text-muted"
                  }`}
                >
                  {s.label} {count}
                </button>
              );
            })}
          </div>

          <div className="mt-4 md:hidden">
            <StageColumn
              stage={mobileStage}
              leads={filtered.filter((l) => l.stage === mobileStage)}
              onMove={move}
            />
          </div>

          <div className="mt-8 hidden gap-3 overflow-x-auto pb-4 md:flex">
            {STAGES.map((s) => (
              <div key={s.id} className="w-[220px] shrink-0">
                <StageColumn
                  stage={s.id}
                  leads={filtered.filter((l) => l.stage === s.id)}
                  onMove={move}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StageColumn({
  stage,
  leads,
  onMove,
}: {
  stage: StageId;
  leads: ReturnType<typeof useLeads>["data"];
  onMove: (id: number, stage: StageId) => void;
}) {
  const meta = STAGES.find((s) => s.id === stage)!;
  const list = leads ?? [];
  const idx = STAGES.findIndex((s) => s.id === stage);
  const prev = idx > 0 ? STAGES[idx - 1].id : null;
  const next = idx < STAGES.length - 1 ? STAGES[idx + 1].id : null;

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-fg">{meta.label}</h2>
        <span className="text-xs tabular-nums text-subtle">{list.length}</span>
      </div>
      <div className="grid gap-2">
        {list.length === 0 ? (
          <p className="rounded-lg bg-surface px-3 py-6 text-center text-xs text-subtle">{meta.hint}</p>
        ) : (
          list.map((lead) => (
            <div key={lead.id} className="grid gap-1">
              <LeadCard lead={lead} />
              <div className="flex gap-1">
                {prev ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 flex-1 text-[11px]"
                    onClick={() => onMove(lead.id, prev)}
                  >
                    Back
                  </Button>
                ) : null}
                {next ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 flex-1 text-[11px]"
                    onClick={() => onMove(lead.id, next)}
                  >
                    Forward
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
