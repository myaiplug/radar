import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CATALOG, VOICE_NOTES, WEEKLY_CADENCE } from "@/lib/radar/catalog";
import { useServices } from "@/lib/radar/hooks";
import { CATEGORIES } from "@/lib/radar/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/playbook")({ component: PlaybookPage });

function PlaybookPage() {
  const { data: services = [] } = useServices();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]["id"]>("audio");
  const slugs = new Set(services.filter((s) => s.active).map((s) => s.slug));
  const entries = CATALOG.filter((c) => c.category === cat);

  return (
    <div>
      <p className="text-xs font-medium tracking-[0.18em] text-steel uppercase">Playbook</p>
      <h1 className="mt-2 font-display text-4xl leading-none md:text-5xl">Where the work lives</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Copy the search. Post the sample. Do not spray a catalog.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-3xl">Week</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {WEEKLY_CADENCE.map((d) => (
            <Card key={d.day} className="rounded-lg p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-mono text-xs tracking-widest text-subtle">{d.day}</p>
                <p className="text-sm font-medium text-fg">{d.focus}</p>
              </div>
              <p className="mt-2 text-sm text-muted">{d.move}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">Voice</h2>
        <ul className="mt-4 space-y-2">
          {VOICE_NOTES.map((note) => (
            <li key={note} className="text-sm text-muted">
              {note}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`h-11 rounded-full px-3.5 text-sm ${
                cat === c.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {entries.map((entry) => (
            <Card key={entry.slug} className="rounded-xl p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-2xl">{entry.name}</h3>
                {slugs.has(entry.slug) ? <Badge tone="ok">Hunting</Badge> : <Badge>Paused</Badge>}
                <span className="text-xs text-subtle">{entry.rateLabel}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{entry.huntHint}</p>
              <div className="mt-4 grid gap-3">
                {entry.places.map((place) => (
                  <div key={place.name} className="rounded-lg bg-elevated p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-fg">{place.name}</p>
                      <CopyQuery query={place.query} />
                    </div>
                    <p className="mt-2 font-mono text-xs leading-relaxed break-all text-steel">{place.query}</p>
                    <p className="mt-2 text-xs text-subtle">{place.note}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function CopyQuery({ query }: { query: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="h-9 shrink-0"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(query);
          toast.success("Copied");
        } catch {
          toast.error("Could not copy");
        }
      }}
    >
      Copy
    </Button>
  );
}
