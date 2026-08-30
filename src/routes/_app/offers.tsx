import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CATALOG } from "@/lib/radar/catalog";
import { useServiceMutation, useServices } from "@/lib/radar/hooks";
import { CATEGORIES } from "@/lib/radar/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/offers")({ component: OffersPage });

function OffersPage() {
  const { data: services = [], isLoading } = useServices();
  const mutate = useServiceMutation();

  return (
    <div>
      <p className="text-xs font-medium tracking-[0.18em] text-steel uppercase">Offers</p>
      <h1 className="mt-2 font-display text-4xl leading-none md:text-5xl">What you sell</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Toggle what you are hunting this week. Edit the rate so pitches stay honest.
      </p>

      {isLoading ? (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        CATEGORIES.map((cat) => {
          const items = services.filter((s) => s.category === cat.id);
          if (items.length === 0) return null;
          return (
            <section key={cat.id} className="mt-10">
              <h2 className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">{cat.label}</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {items.map((s) => {
                  const extra = CATALOG.find((c) => c.slug === s.slug);
                  return (
                    <Card key={s.id} className="rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-fg">{s.name}</h3>
                          <p className="mt-1 text-sm text-muted">{s.blurb}</p>
                        </div>
                        <Badge tone={s.active ? "ok" : "muted"}>{s.active ? "On" : "Off"}</Badge>
                      </div>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          defaultValue={s.rateLabel}
                          aria-label={`${s.name} rate`}
                          className="sm:max-w-40"
                          onBlur={(e) => {
                            const next = e.target.value.trim();
                            if (next && next !== s.rateLabel) {
                              mutate.mutate(
                                { id: s.id, rateLabel: next },
                                { onError: (err) => toast.error(err.message) },
                              );
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant={s.active ? "outline" : "secondary"}
                          onClick={() =>
                            mutate.mutate(
                              { id: s.id, active: !s.active },
                              { onError: (err) => toast.error(err.message) },
                            )
                          }
                        >
                          {s.active ? "Pause" : "Activate"}
                        </Button>
                      </div>
                      {extra ? (
                        <p className="mt-3 text-xs text-subtle">{extra.huntHint}</p>
                      ) : null}
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
