import { Link } from "@tanstack/react-router";
import { CATALOG } from "@/lib/radar/catalog";
import { CATEGORIES } from "@/lib/radar/types";
import { RadarMark } from "./radar-mark";
import { Button } from "./ui/button";

const STEPS = [
  {
    n: "01",
    title: "Hunt free",
    body: "One live hunt. Radar pulls real posts from the last 48 hours on X, Reddit, and Upwork. Permalink on every card.",
  },
  {
    n: "02",
    title: "Two leads held",
    body: "Park two names on the board. 48 hours. Then they go dark: posts, contacts, the lot.",
  },
  {
    n: "03",
    title: "Unlock $5",
    body: "Once. Keep every lead. Hunt without a cap. Pitch writer opens. No subscription.",
  },
];

export function Landing() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <div className="flex items-center gap-2.5">
          <RadarMark className="text-accent" />
          <span className="font-display text-2xl leading-none">Radar</span>
        </div>
        <Button asChild size="sm">
          <Link to="/login">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 pt-10 pb-12 md:px-8 md:pt-16 md:pb-16">
        <p className="text-xs font-medium tracking-[0.18em] text-steel uppercase">
          Personal freelance desk
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-fg md:text-7xl">
          Find the work.
          <br />
          Keep the work.
        </h1>
        <p className="mt-6 max-w-xl text-base text-muted md:text-lg">
          Hunt a niche. Get posts from the last 48 hours. Real permalinks. Save two leads free. They go dark in 48 hours unless you unlock the desk for $5.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/login">Hunt free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">Unlock $5</Link>
          </Button>
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-subtle">
          Beats, mix, stems, screw, repair, LUFS, covers, graphics, motion, video,
          ghost writing, web, vibe coding, agents.
        </p>
      </section>

      <section className="border-y border-border">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-3 md:px-8 md:py-16">
          {STEPS.map((step) => (
            <div key={step.n}>
              <p className="font-mono text-xs tracking-widest text-subtle">{step.n}</p>
              <h2 className="mt-3 font-display text-3xl">{step.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <p className="text-xs font-medium tracking-[0.18em] text-steel uppercase">Price</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">$5 once.</h2>
        <p className="mt-4 max-w-xl text-sm text-muted md:text-base">
          No monthly. The free tease is supposed to sting. You find real names, you feel them slipping, you keep them.
        </p>
        <ul className="mt-8 grid gap-3 text-sm text-fg md:grid-cols-2">
          <li className="rounded-lg bg-surface px-4 py-3">Live posts from the last 48 hours</li>
          <li className="rounded-lg bg-surface px-4 py-3">Unlimited hunts after unlock</li>
          <li className="rounded-lg bg-surface px-4 py-3">Board, follow-ups, dollar value</li>
          <li className="rounded-lg bg-surface px-4 py-3">DM / email / proposal writer</li>
        </ul>
        <Button asChild size="lg" className="mt-8">
          <Link to="/login">Start the free hunt</Link>
        </Button>
      </section>

      <section id="offers" className="mx-auto w-full max-w-6xl px-5 pb-16 md:px-8 md:pb-24">
        <p className="text-xs font-medium tracking-[0.18em] text-steel uppercase">
          Built around your stack
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Fifteen offers. One board.</h2>
        <p className="mt-4 max-w-2xl text-sm text-muted md:text-base">
          Beats, mix, stems, screw mixes, repair, LUFS, covers, motion, video,
          ghost writing, sites, vibe coding, agents. Radar hunts per skill so
          you are not spraying one generic pitch.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <h3 className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">
                {cat.label}
              </h3>
              <ul className="mt-3 space-y-2">
                {CATALOG.filter((s) => s.category === cat.id).map((s) => (
                  <li key={s.slug} className="text-sm text-fg">
                    {s.name}
                    <span className="mt-0.5 block text-xs text-subtle">{s.rateLabel}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-xs text-subtle md:flex-row md:items-center md:justify-between md:px-8">
          <span>Radar · $5 lifetime desk</span>
          <span>Built by bZ in Louisville, KY</span>
        </div>
      </footer>
    </div>
  );
}
