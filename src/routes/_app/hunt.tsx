import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAccess, useHunt, useLeadMutations, useServices } from "@/lib/radar/hooks";
import {
  CATEGORIES,
  HUNT_WINDOWS,
  formatUsd,
  freshLabel,
  sourceLabel,
  type Prospect,
} from "@/lib/radar/types";
import { SourcePost } from "@/components/post-link";
import { UnlockButton } from "@/components/unlock-button";
import { UnlockCard } from "@/components/unlock-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/hunt")({ component: HuntPage });

function HuntPage() {
  const { data: services = [], isLoading } = useServices();
  const { data: access } = useAccess();
  const hunt = useHunt();
  const { create } = useLeadMutations();
  const [selected, setSelected] = useState<number[]>([]);
  const [niche, setNiche] = useState("independent artists and small labels");
  const [geo, setGeo] = useState("Louisville, KY plus remote US");
  const [notes, setNotes] = useState("");
  const [windowHours, setWindowHours] = useState(48);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const prospects = hunt.data?.ok ? hunt.data.prospects : [];
  const widened = hunt.data?.ok ? hunt.data.widened : false;
  const resultHours = hunt.data?.ok ? hunt.data.windowHours : windowHours;
  const error = hunt.data && !hunt.data.ok ? hunt.data.error : hunt.error?.message;
  const unlocked = access?.plan === "unlocked";
  const canHunt = access?.canHunt ?? true;
  const savesLeft = access?.savesLeft ?? 2;

  function toggle(id: number) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function saveProspect(p: Prospect) {
    if (!unlocked && savesLeft <= 0) {
      toast.error("Free desk holds 2 leads. Unlock the desk to keep the rest.");
      return;
    }
    const key = p.postUrl || `${p.name}|${p.contact}`;
    create.mutate(
      {
        name: p.name,
        company: p.company,
        roleTitle: p.role,
        contact: p.contact,
        source: p.source === "other" ? "hunt" : p.source,
        serviceId: selected[0] ?? services.find((s) => s.active)?.id ?? null,
        valueUsd: p.estimatedValue,
        score: p.score,
        why: p.why,
        angle: p.angle,
        nextAction: p.nextAction,
        postUrl: p.postUrl,
        postQuote: p.postQuote,
        stage: "new",
      },
      {
        onSuccess: () => {
          setSaved((cur) => new Set(cur).add(key));
          toast.success(`Saved ${p.name}`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div>
      <p className="text-xs font-medium tracking-[0.18em] text-steel uppercase">Hunt</p>
      <h1 className="mt-2 font-display text-4xl leading-none md:text-5xl">Live asks</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        {unlocked
          ? "Radar matches public posts from Reddit, Hacker News, and job boards. Every card has a real permalink."
          : "One free hunt. Public posts from the last 48 hours. Park 2 names. The rest walk if you leave."}
      </p>

      {!canHunt ? (
        <div className="mt-8 max-w-xl">
          <UnlockCard
            title="Hunt is locked"
            body="That was the tease. Unlock the desk for unlimited hunts and to keep every lead you already parked."
          />
        </div>
      ) : (
        <form
          className="mt-8 grid gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(new Set());
            hunt.mutate(
              { serviceIds: selected, niche, geo, notes, windowHours },
              { onError: (err) => toast.error(err.message) },
            );
          }}
        >
          <div>
            <Label>Offers to hunt</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {isLoading
                ? null
                : CATEGORIES.map((cat) =>
                    services
                      .filter((s) => s.category === cat.id && s.active)
                      .map((s) => {
                        const on = selected.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggle(s.id)}
                            className={`h-11 rounded-full px-3.5 text-sm transition-colors duration-150 ${
                              on ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"
                            }`}
                          >
                            {s.name}
                          </button>
                        );
                      }),
                  )}
            </div>
            <p className="mt-2 text-xs text-subtle">Leave empty to hunt your top four active offers.</p>
          </div>

          <div>
            <Label>When</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {HUNT_WINDOWS.map((w) => {
                const on = windowHours === w.hours;
                return (
                  <button
                    key={w.hours}
                    type="button"
                    onClick={() => setWindowHours(w.hours)}
                    className={`h-11 rounded-full px-3.5 text-sm transition-colors duration-150 ${
                      on ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"
                    }`}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="niche">Niche</Label>
              <Input id="niche" value={niche} onChange={(e) => setNiche(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="geo">Geography</Label>
              <Input id="geo" value={geo} onChange={(e) => setGeo(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Extra brief</Label>
            <Textarea
              id="notes"
              className="min-h-20"
              placeholder="Example: artists dropping this month, studios that still mix in the box, venues with ugly flyers"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div>
            <Button type="submit" disabled={hunt.isPending}>
              {hunt.isPending ? "Hunting live posts" : unlocked ? "Run live hunt" : "Run free hunt"}
            </Button>
          </div>
        </form>
      )}

      {hunt.isPending ? (
        <div className="mt-8">
          <p className="text-sm text-muted">
            Matching public hiring posts from the{" "}
            {windowHours === 48 ? "last 48 hours" : "last 7 days"}. Sellers get dropped.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Skeleton className="h-52 rounded-xl" />
            <Skeleton className="h-52 rounded-xl" />
            <Skeleton className="h-52 rounded-xl" />
            <Skeleton className="h-52 rounded-xl" />
          </div>
        </div>
      ) : null}

      {error && !hunt.isPending ? <p className="mt-6 text-sm text-danger">{error}</p> : null}

      {prospects.length > 0 && !hunt.isPending ? (
        <section className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl">{prospects.length} live posts</h2>
              <p className="mt-1 text-sm text-muted">
                {resultHours === 48 ? "Last 48 hours" : "This week"}
                {widened ? ". Nothing in 48h, so Radar opened the week." : ". Real permalinks only."}
              </p>
              {!unlocked ? (
                <p className="mt-1 text-sm text-warn">
                  {savesLeft} save slot{savesLeft === 1 ? "" : "s"} left. Leave this page and the rest are gone.
                </p>
              ) : null}
            </div>
            <Button asChild variant="link" size="sm">
              <Link to="/board">Open board</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {prospects.map((p) => {
              const key = p.postUrl || `${p.name}|${p.contact}`;
              const isSaved = saved.has(key);
              const blocked = !isSaved && !unlocked && savesLeft <= 0;
              return (
                <Card key={key} className="rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-fg">{p.name}</p>
                      <p className="text-xs text-muted">
                        {[p.role, p.company].filter(Boolean).join(" · ") || sourceLabel(p.source)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge tone="ok">{freshLabel(p.hoursAgo)}</Badge>
                      <Badge tone="steel">{p.score}</Badge>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-fg">{p.why}</p>
                  <p className="mt-2 text-sm text-muted">{p.angle}</p>
                  <p className="mt-3 text-xs text-subtle">
                    {p.contact || sourceLabel(p.source)} · {p.nextAction} · {formatUsd(p.estimatedValue)}
                  </p>
                  <SourcePost
                    url={p.postUrl}
                    quote={p.postQuote}
                    inspectable={unlocked}
                    className="mt-4"
                  />
                  <div className="mt-4">
                    {blocked ? (
                      <UnlockButton size="sm" label="Unlock to save" />
                    ) : (
                      <Button
                        size="sm"
                        variant={isSaved ? "outline" : "default"}
                        disabled={isSaved || create.isPending}
                        onClick={() => saveProspect(p)}
                      >
                        {isSaved ? "Saved" : "Save to board"}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          {!unlocked ? (
            <div className="mt-8 max-w-xl">
              <UnlockCard
                title="Don't let them walk"
                body="You just found live work. Two names fit on the free desk. Unlock keeps the rest before they go dark."
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
