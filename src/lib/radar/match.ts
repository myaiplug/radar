import { CATALOG } from "./catalog";
import type { Prospect, Service, SourceId } from "./types";

export type FeedPost = {
  source: "reddit" | "hn" | "job";
  name: string;
  company: string;
  contact: string;
  title: string;
  text: string;
  url: string;
  createdAt: string;
};

export type FeedFile = {
  generatedAt: string;
  posts: FeedPost[];
};

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "your",
  "you",
  "this",
  "that",
  "from",
  "into",
  "who",
  "still",
  "are",
  "was",
  "not",
  "but",
  "its",
  "it's",
  "per",
  "via",
  "out",
  "off",
  "our",
  "their",
  "they",
  "them",
  "have",
  "has",
  "had",
  "been",
  "will",
  "just",
  "about",
  "after",
  "before",
  "need",
  "looking",
  "want",
  "anyone",
]);

export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word.length > 2 && !STOP.has(word));
}

export function hoursAgo(iso: string, now = Date.now()): number | null {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.round((now - t) / 36e5));
}

function haystack(post: FeedPost): string {
  return `${post.title}\n${post.text}`.toLowerCase();
}

function isSellerOrDead(post: FeedPost): boolean {
  if (/\[(for hire|offer)\]/i.test(post.title)) return true;
  const body = post.text.trim().toLowerCase();
  return body === "[removed]" || body === "[deleted]" || body.length < 20;
}

export function scorePost(post: FeedPost, words: string[]): number {
  const hay = haystack(post);
  let score = 0;
  const seen = new Set<string>();
  for (const word of words) {
    if (seen.has(word) || word.length < 3) continue;
    seen.add(word);
    if (!hay.includes(word)) continue;
    score += word.length >= 6 ? 2 : 1;
  }
  return score;
}

function dollars(text: string): number {
  const match = text.replace(/,/g, "").match(/\$(\d{2,5})/);
  if (!match) return 0;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : 0;
}

function midpoint(rateLabel: string): number {
  const nums = rateLabel.replace(/,/g, "").match(/\d+/g)?.map(Number) ?? [];
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];
  return Math.round((nums[0] + nums[1]) / 2);
}

function sourceId(source: FeedPost["source"]): SourceId {
  if (source === "reddit") return "reddit";
  if (source === "job") return "other";
  return "other";
}

export function huntFeed(args: {
  posts: FeedPost[];
  services: Service[];
  niche: string;
  geo: string;
  notes: string;
  windowHours: number;
  now?: number;
}): { prospects: Prospect[]; windowHours: number; widened: boolean } | { error: string } {
  const now = args.now ?? Date.now();
  const services =
    args.services.length > 0
      ? args.services
      : CATALOG.slice(0, 4).map((entry, index) => ({
          id: index + 1,
          slug: entry.slug,
          name: entry.name,
          category: entry.category,
          blurb: entry.blurb,
          rateLabel: entry.rateLabel,
          huntHint: entry.huntHint,
          sortOrder: index,
          active: true,
        }));
  if (services.length === 0) return { error: "Turn on at least one offer first." };

  const serviceWords = services.flatMap((service) => tokens(`${service.name} ${service.slug}`));
  const contextWords = [...tokens(args.niche), ...tokens(args.notes)];

  const within = (hours: number) =>
    args.posts.filter((post) => {
      if (isSellerOrDead(post)) return false;
      const age = hoursAgo(post.createdAt, now);
      return age != null && age <= hours;
    });

  let hours = args.windowHours === 168 ? 168 : 48;
  let widened = false;
  let pool = within(hours);
  if (pool.length === 0 && hours === 48) {
    hours = 168;
    widened = true;
    pool = within(hours);
  }
  if (pool.length === 0) {
    hours = 24 * 14;
    widened = true;
    pool = within(hours);
  }

  const rank = (minServiceHits: number) =>
    pool
      .map((post) => {
        const serviceHits = scorePost(post, serviceWords);
        const contextHits = scorePost(post, contextWords);
        return { post, score: serviceHits * 3 + contextHits, serviceHits };
      })
      .filter((row) => row.serviceHits >= minServiceHits)
      .sort((a, b) => b.score - a.score || Date.parse(b.post.createdAt) - Date.parse(a.post.createdAt));

  let picked = rank(2);
  if (picked.length < 4) {
    picked = rank(1);
    widened = true;
  }

  const primary = services[0];
  const prospects = picked.slice(0, 8).map(({ post, score }) => {
    const quote = post.title.trim();
    const excerpt = post.text.replace(/\s+/g, " ").trim().slice(0, 280);
    const value = dollars(`${post.title} ${post.text}`) || midpoint(primary?.rateLabel ?? "");
    return {
      name: post.name || "Unknown",
      company: post.company,
      role: quote.slice(0, 90),
      contact: post.contact,
      source: sourceId(post.source),
      why: excerpt || quote,
      angle: primary?.huntHint ?? "",
      estimatedValue: value,
      nextAction: "Reply on the permalink with one specific offer. Skip the rate card.",
      score: Math.max(35, Math.min(96, 40 + score * 6)),
      postUrl: post.url,
      postQuote: excerpt ? `${quote} — ${excerpt}` : quote,
      hoursAgo: hoursAgo(post.createdAt, now),
    } satisfies Prospect;
  });

  if (prospects.length === 0) {
    return {
      error:
        hours <= 48
          ? "No live hiring posts in the last 48 hours. Switch to This week."
          : "No live hiring posts matched these offers. Switch offers or widen the niche.",
    };
  }

  return { prospects, windowHours: hours > 168 ? 168 : hours, widened };
}
