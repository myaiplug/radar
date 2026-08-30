import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { CATALOG, liveQueries } from "./catalog";
import { loadAccess, markHuntUsed } from "./access";
import { SOURCES, type ChannelId, type Prospect, type SourceId, type ThreadPeek, type ThreadReply } from "./types";
import {
  collectUrls,
  groundPostUrl,
  handleFromPostUrl,
  isPostUrl,
  rankPostUrls,
  sanitizeUrl,
  uniqueUrls,
  urlKey,
} from "./url";

const SOURCE_IDS = new Set(SOURCES.map((s) => s.id));
const WEB_DOMAINS = ["reddit.com", "upwork.com", "fiverr.com"];
const JSON_SHAPE =
  '{"prospects":[{"name":"","company":"","role":"","contact":"","source":"x|reddit|upwork|fiverr|instagram|local|other","why":"","angle":"","estimatedValue":0,"nextAction":"","score":50,"postUrl":"https://...","postQuote":"","hoursAgo":0}]}';

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return JSON");
  }
  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}

function outputText(body: Record<string, unknown>): string {
  if (typeof body.output_text === "string" && body.output_text.trim()) {
    return body.output_text;
  }
  const chunks: string[] = [];
  const take = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) take(item);
      return;
    }
    const rec = value as Record<string, unknown>;
    if (typeof rec.text === "string" && (rec.type === "output_text" || rec.type === "text")) {
      chunks.push(rec.text);
    }
    if (Array.isArray(rec.content)) take(rec.content);
  };
  const output = Array.isArray(body.output) ? body.output : [];
  for (const item of output) {
    if (item && typeof item === "object" && (item as { type?: unknown }).type === "message") {
      take(item);
    }
  }
  if (chunks.length) return chunks.join("\n");
  const choices = body.choices as { message?: { content?: string } }[] | undefined;
  return choices?.[0]?.message?.content ?? "";
}

function pushUrl(urls: string[], raw: unknown) {
  const value =
    typeof raw === "string" ? raw : raw && typeof raw === "object" ? String((raw as { url?: unknown }).url ?? "") : "";
  const url = sanitizeUrl(value);
  if (url) urls.push(url);
}

function searchCitations(body: Record<string, unknown>): string[] {
  const urls: string[] = [];
  if (Array.isArray(body.citations)) {
    for (const item of body.citations) pushUrl(urls, item);
  }

  const walk = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (typeof value !== "object") return;
    const rec = value as Record<string, unknown>;
    if (rec.type === "url_citation") {
      pushUrl(urls, rec.url);
      return;
    }
    if (Array.isArray(rec.annotations)) walk(rec.annotations);
    if (rec.type === "custom_tool_call" && rec.name === "x_thread_fetch") {
      try {
        const input = typeof rec.input === "string" ? JSON.parse(rec.input) : rec.input;
        const id = String((input as { post_id?: unknown } | null)?.post_id ?? "");
        if (/^\d{8,}$/.test(id)) urls.push(`https://x.com/i/status/${id}`);
      } catch {
        /* ignore */
      }
    }
    if (
      rec.type === "custom_tool_call_output" ||
      rec.type === "function_call_output" ||
      rec.type === "tool_result"
    ) {
      collectUrls(rec, urls);
      return;
    }
    for (const [key, nested] of Object.entries(rec)) {
      if (key === "text" || key === "summary" || key === "input") continue;
      walk(nested);
    }
  };

  walk(body.output);
  return rankPostUrls(uniqueUrls(urls)).filter(isPostUrl);
}

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600_000).toISOString().slice(0, 10);
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function huntError(err: unknown): string {
  if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
    return "Search timed out. Run it again.";
  }
  return err instanceof Error ? err.message : "Hunt failed";
}

type HuntTools = {
  xFrom?: string;
  xOpen?: boolean;
  webDomains?: string[];
  webOpen?: boolean;
};

async function chat(system: string, user: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("AI is not available in this environment");
  }
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.7,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) {
    throw new Error(`xAI API error ${res.status}`);
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return body.choices?.[0]?.message?.content ?? "";
}

async function huntSearch(prompt: string, tools: HuntTools): Promise<{ text: string; urls: string[] }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("AI is not available in this environment");
  }
  const toolList: Record<string, unknown>[] = [];
  if (tools.xOpen) {
    toolList.push({ type: "x_search" });
  } else if (tools.xFrom) {
    toolList.push({
      type: "x_search",
      from_date: tools.xFrom,
      to_date: todayUtc(),
    });
  }
  if (tools.webOpen) {
    toolList.push({ type: "web_search" });
  } else if (tools.webDomains?.length) {
    toolList.push({
      type: "web_search",
      filters: { allowed_domains: tools.webDomains.slice(0, 5) },
    });
  }
  if (toolList.length === 0) {
    toolList.push({ type: "x_search", from_date: isoHoursAgo(48), to_date: todayUtc() });
    toolList.push({ type: "web_search", filters: { allowed_domains: WEB_DOMAINS } });
  }

  const res = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      tools: toolList,
      input: prompt,
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) {
    throw new Error(`xAI API error ${res.status}`);
  }
  const body = (await res.json()) as Record<string, unknown>;
  return {
    text: outputText(body),
    urls: searchCitations(body),
  };
}

function sourceFromUrl(url: string, fallback: SourceId): SourceId {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "x.com" || host === "twitter.com") return "x";
    if (host.includes("reddit.com")) return "reddit";
    if (host.includes("upwork.com")) return "upwork";
    if (host.includes("fiverr.com")) return "fiverr";
    if (host.includes("instagram.com")) return "instagram";
    return fallback;
  } catch {
    return fallback;
  }
}

function asHoursAgo(raw: Record<string, unknown>, windowHours: number): number | null {
  const n = Number(raw.hoursAgo ?? raw.ageHours);
  if (Number.isFinite(n) && n >= 0 && n <= windowHours + 24) return Math.round(n);
  const posted = String(raw.postedAt ?? raw.date ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(posted)) {
    const t = Date.parse(posted);
    if (Number.isFinite(t)) {
      const hours = Math.max(0, Math.round((Date.now() - t) / 3600000));
      if (hours <= windowHours + 24) return hours;
    }
  }
  return null;
}

function asProspect(
  raw: Record<string, unknown>,
  citations: string[],
  used: Set<string>,
  windowHours: number,
): Prospect | null {
  const postUrl = groundPostUrl(raw, citations, used);
  if (!isPostUrl(postUrl)) return null;
  const hoursAgo = asHoursAgo(raw, windowHours);
  if (hoursAgo != null && hoursAgo > windowHours + 12) return null;
  used.add(urlKey(postUrl));
  const handle = handleFromPostUrl(postUrl);
  const name = String(raw.name ?? "").trim() || handle || "Live post";
  const sourceRaw = String(raw.source ?? "other").toLowerCase();
  const source: SourceId = SOURCE_IDS.has(sourceRaw as SourceId) ? (sourceRaw as SourceId) : "other";
  return {
    name,
    company: String(raw.company ?? "").trim(),
    role: String(raw.role ?? "").trim(),
    contact: String(raw.contact ?? "").trim() || handle,
    source: sourceFromUrl(postUrl, source),
    why: String(raw.why ?? "").trim() || "Live post from search. Open it and confirm they are still asking.",
    angle: String(raw.angle ?? "").trim() || "Reply in the thread with one sample that matches the ask.",
    estimatedValue: Math.max(0, Math.round(Number(raw.estimatedValue ?? 0) || 0)),
    nextAction: String(raw.nextAction ?? "").trim() || "Open the post. If the ask is real, save and pitch.",
    score: Math.min(100, Math.max(1, Math.round(Number(raw.score ?? 50) || 50))),
    postUrl,
    postQuote: String(raw.postQuote ?? raw.quote ?? "").trim(),
    hoursAgo,
  };
}

function parseProspects(text: string, urls: string[], used: Set<string>, windowHours: number): Prospect[] {
  try {
    const parsed = extractJson(text) as { prospects?: unknown };
    const list = Array.isArray(parsed.prospects) ? parsed.prospects : [];
    return list
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item) => asProspect(item, urls, used, windowHours))
      .filter((p): p is Prospect => p !== null && isPostUrl(p.postUrl));
  } catch {
    return [];
  }
}

function thinProspect(url: string): Prospect {
  const handle = handleFromPostUrl(url);
  return {
    name: handle || "Live post",
    company: "",
    role: "",
    contact: handle,
    source: sourceFromUrl(url, "other"),
    why: "Live post from search. Open it and confirm they are still asking.",
    angle: "Reply in the thread with one sample that matches the ask.",
    estimatedValue: 0,
    nextAction: "Open the post. If the ask is real, save and pitch.",
    score: 55,
    postUrl: url,
    postQuote: "",
    hoursAgo: null,
  };
}

function sortProspects(list: Prospect[]): Prospect[] {
  return [...list].sort((a, b) => {
    const aq = a.postQuote ? 1 : 0;
    const bq = b.postQuote ? 1 : 0;
    if (bq !== aq) return bq - aq;
    const ah = a.hoursAgo ?? 999;
    const bh = b.hoursAgo ?? 999;
    if (ah !== bh) return ah - bh;
    return b.score - a.score;
  });
}

function rulesBlock(fromDate: string, windowLabel: string): string {
  return `Rules:
- Each prospect MUST be grounded in a real post from search citations. Copy postUrl exactly. Never invent a URL or status id.
- Prefer x.com/{handle}/status/{id} or x.com/i/status/{id} for X, reddit.com/r/{sub}/comments/{id}/ for Reddit, job permalink for Upwork.
- Profiles, homepages, search pages, and seller ads are not allowed.
- KEEP only authors REQUESTING paid work, a collab, or help they would pay for.
- DROP people selling beats/mixes/gigs, recaps, memes, news, and closed jobs.
- Budget: at most 6 tool calls. Search, then return JSON. Stop once you have 6 real hiring posts.
- Every X query MUST include since:${fromDate} and stay inside ${windowLabel}.
- postQuote is 1-2 sentences copied from the post (the actual ask).
- Contact is a public handle, not an invented email.
- estimatedValue is a realistic one-job USD number.
- score 1-100 for fit and likelihood they buy soon.
- hoursAgo is hours since the post (integer). Omit it if you do not know.
- If you cannot attach a real citation permalink, skip that prospect.`;
}

function playbookFor(
  services: { name: string; blurb: string; hunt_hint: string; slug: string }[],
): string {
  return services
    .map((s) => {
      const extra = CATALOG.find((c) => c.slug === s.slug);
      const places = extra?.places.map((p) => `${p.name}: ${p.query}`).join(" | ") ?? "";
      return `- ${s.name}: ${s.hunt_hint || s.blurb}${places ? ` Search: ${places}` : ""}`;
    })
    .join("\n");
}

type HuntPack = {
  prospects: Prospect[];
  citations: string[];
  used: Set<string>;
};

async function searchWindow(args: {
  hours: number;
  playbook: string;
  queries: { x: string[]; web: string[] };
  niche: string;
  geo: string;
  notes: string;
}): Promise<HuntPack> {
  const fromDate = isoHoursAgo(args.hours);
  const windowLabel = args.hours <= 48 ? "the last 48 hours" : "the last 7 days";
  const today = todayUtc();
  const used = new Set<string>();
  const rules = rulesBlock(fromDate, windowLabel);

  const xPrompt = `You are a freelance lead researcher. TODAY (UTC) is ${today}. Use X Search only. Find REAL posts from ${windowLabel} (${fromDate} through ${today}) where someone is asking to hire, collab, or needs these services.

Services:
${args.playbook}

Target niche: ${args.niche}
Geography: ${args.geo}
${args.notes ? `Extra brief: ${args.notes}` : ""}

You MUST run x_search with these queries, Latest:
${args.queries.x.map((q) => `- ${q}`).join("\n") || "- (need a producer) OR (looking for a mix) OR (need cover art)"}

Also run close variants for ${args.niche} in ${args.geo}.

Return ONLY valid JSON:
${JSON_SHAPE}

${rules}`;

  const webPrompt = `You are a freelance lead researcher. TODAY (UTC) is ${today}. Use Web Search only on Reddit, Upwork, and Fiverr. Find REAL posts and jobs from ${windowLabel} (${fromDate} through ${today}) where someone is asking to hire, collab, or needs these services.

Services:
${args.playbook}

Target niche: ${args.niche}
Geography: ${args.geo}
${args.notes ? `Extra brief: ${args.notes}` : ""}

You MUST search these queries:
${args.queries.web.map((q) => `- ${q}`).join("\n") || `- site:reddit.com hiring producer OR mix OR cover art after:${fromDate}`}

Keep buyer posts ([HIRING], "looking for", "need someone"). Drop [FOR HIRE] seller ads.

Return ONLY valid JSON:
${JSON_SHAPE}

${rules}`;

  const urls: string[] = [];
  let xText = "";

  try {
    const xRes = await huntSearch(xPrompt, { xFrom: fromDate });
    xText = xRes.text;
    urls.push(...xRes.urls);
  } catch {
    /* web pass can still save the hunt */
  }

  let citations = rankPostUrls(urls).filter(isPostUrl);
  let prospects = sortProspects(parseProspects(xText, citations, used, args.hours));

  if (prospects.length < 4) {
    try {
      const webRes = await huntSearch(webPrompt, { webDomains: WEB_DOMAINS });
      citations = rankPostUrls([...urls, ...webRes.urls]).filter(isPostUrl);
      const extra = parseProspects(webRes.text, citations, used, args.hours);
      prospects = sortProspects([...prospects, ...extra]);
    } catch {
      /* keep whatever X returned */
    }
  }

  return { prospects, citations, used };
}

async function describePosts(args: {
  urls: string[];
  playbook: string;
  niche: string;
  geo: string;
  used: Set<string>;
  windowHours: number;
}): Promise<Prospect[]> {
  if (args.urls.length === 0) return [];
  const fromDate = isoHoursAgo(args.windowHours);
  const windowLabel = args.windowHours <= 48 ? "the last 48 hours" : "the last 7 days";
  const prompt = `Fetch these REAL posts. They came from live X/web search. A freelancer needs only the ones where the author is REQUESTING paid work, a collab, or help matching the services. Drop sellers, recaps, closed jobs, and unrelated posts.

Services:
${args.playbook}

Target niche: ${args.niche}
Geography: ${args.geo}

Posts:
${args.urls.map((url) => `- ${url}`).join("\n")}

Use X Search thread fetch and Web Search on these URLs only. Return ONLY valid JSON:
${JSON_SHAPE}

${rulesBlock(fromDate, windowLabel)}
- postUrl MUST be one of the URLs listed above, copied exactly.`;

  const { text, urls } = await huntSearch(prompt, {
    xFrom: fromDate,
    webDomains: ["reddit.com", "upwork.com", "fiverr.com", "x.com", "twitter.com"],
  });
  return parseProspects(text, rankPostUrls([...args.urls, ...urls]), args.used, args.windowHours);
}

export const runHunt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      serviceIds: number[];
      niche: string;
      geo: string;
      notes: string;
      windowHours?: number;
    }) => input,
  )
  .handler(
    async ({
      context,
      data,
    }): Promise<
      | { ok: true; prospects: Prospect[]; windowHours: number; widened: boolean }
      | { ok: false; error: string }
    > => {
      if (!process.env.XAI_API_KEY) {
        return { ok: false, error: "AI hunt is not available right now." };
      }
      const access = await loadAccess(context.userId);
      if (!access.canHunt) {
        if (access.dark) return { ok: false, error: "Your leads went dark. Unlock $5 to hunt again." };
        return { ok: false, error: "Free hunt is used. Unlock $5 for unlimited hunts." };
      }
      const sql = await getSql();
      let services: { name: string; blurb: string; hunt_hint: string; slug: string }[];
      if (data.serviceIds.length) {
        const ids = data.serviceIds.filter((n) => Number.isFinite(n));
        if (ids.length === 0) {
          return { ok: false, error: "Turn on at least one offer first." };
        }
        const placeholders = ids.map((_, i) => `$${i + 2}`).join(",");
        services = await sql.query(
          `select name, blurb, hunt_hint, slug from services
           where user_id = $1 and id in (${placeholders})`,
          [context.userId, ...ids],
        );
      } else {
        services = await sql`
          select name, blurb, hunt_hint, slug from services
          where user_id = ${context.userId} and active = true
          order by sort_order
          limit 4
        `;
      }
      if (services.length === 0) {
        return { ok: false, error: "Turn on at least one offer first." };
      }

      const playbook = playbookFor(services);
      const niche = data.niche.trim() || "independent artists, small labels, local brands, and founders";
      const geo = data.geo.trim() || "Louisville, KY plus remote US";
      const notes = data.notes.trim();
      const requestedHours = data.windowHours === 168 ? 168 : 48;

      try {
        let hours = requestedHours;
        let widened = false;
        const queries = liveQueries(
          services.map((s) => s.slug),
          isoHoursAgo(hours),
        );
        let pack = await searchWindow({ hours, playbook, queries, niche, geo, notes });

        if (pack.citations.length === 0 && hours === 48) {
          hours = 168;
          widened = true;
          pack = await searchWindow({
            hours,
            playbook,
            queries: liveQueries(
              services.map((s) => s.slug),
              isoHoursAgo(168),
            ),
            niche,
            geo,
            notes,
          });
        }

        if (pack.prospects.length < 4) {
          const leftover = pack.citations.filter((url) => !pack.used.has(urlKey(url))).slice(0, 10);
          if (leftover.length) {
            const extra = await describePosts({
              urls: leftover,
              playbook,
              niche,
              geo,
              used: pack.used,
              windowHours: hours,
            });
            pack.prospects = sortProspects([...pack.prospects, ...extra]);
          }
        }

        if (pack.prospects.length === 0 && pack.citations.length > 0) {
          pack.prospects = pack.citations.slice(0, 6).map(thinProspect);
        }

        const prospects = sortProspects(pack.prospects).slice(0, 8);
        if (prospects.length === 0) {
          return {
            ok: false,
            error:
              hours === 168
                ? "No live hiring posts this week. Switch offers or widen the niche."
                : "No live hiring posts in the last 48 hours. Switch to This week.",
          };
        }

        await markHuntUsed(context.userId);
        return { ok: true, prospects, windowHours: hours, widened };
      } catch (err) {
        return { ok: false, error: huntError(err) };
      }
    },
  );

function asReply(raw: Record<string, unknown>): ThreadReply | null {
  const text = String(raw.text ?? raw.body ?? raw.quote ?? "").trim();
  if (!text) return null;
  return {
    author: String(raw.author ?? raw.name ?? raw.handle ?? "unknown").trim() || "unknown",
    text,
    url: sanitizeUrl(String(raw.url ?? raw.link ?? "")),
  };
}

export const inspectThread = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { postUrl: string }) => input)
  .handler(async ({ context, data }): Promise<{ ok: true; peek: ThreadPeek } | { ok: false; error: string }> => {
    const access = await loadAccess(context.userId);
    if (!access.canInspect) {
      return { ok: false, error: "Reply check is on the full desk. Unlock $5." };
    }
    if (!process.env.XAI_API_KEY) {
      return { ok: false, error: "Thread check is not available right now." };
    }
    const postUrl = sanitizeUrl(data.postUrl);
    if (!isPostUrl(postUrl)) {
      return { ok: false, error: "Need a direct post or job URL first." };
    }

    const prompt = `Fetch this exact public post and the replies under it. A freelancer needs proof it is real and wants to see who already responded before pitching.

Post URL: ${postUrl}

Use X Search thread fetch and Web Search on that URL only. Return ONLY valid JSON:
{"quote":"","stillOpen":true,"note":"","replies":[{"author":"","text":"","url":""}]}

Rules:
- quote is the original post text, copied closely.
- replies are OTHER people answering the post, not the original poster. Max 8.
- url on a reply is the direct permalink to that reply if you have it.
- stillOpen is false if they already hired, closed it, or the job expired.
- note is one sentence: how crowded the thread is and whether a pitch still makes sense.
- Never invent replies or URLs. If you cannot see the thread, empty replies and say so in note.`;

    try {
      const { text } = await huntSearch(prompt, {
        xOpen: true,
        webOpen: true,
      });
      const parsed = extractJson(text) as {
        quote?: unknown;
        stillOpen?: unknown;
        note?: unknown;
        replies?: unknown;
      };
      const replies = Array.isArray(parsed.replies)
        ? parsed.replies
            .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
            .map(asReply)
            .filter((item): item is ThreadReply => item !== null)
            .slice(0, 8)
        : [];
      return {
        ok: true,
        peek: {
          quote: String(parsed.quote ?? "").trim(),
          stillOpen: parsed.stillOpen !== false,
          note: String(parsed.note ?? "").trim(),
          replies,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Thread check failed";
      return { ok: false, error: message };
    }
  });

export const writeOutreach = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      leadId: number;
      channel: ChannelId;
      extra?: string;
    }) => input,
  )
  .handler(async ({ context, data }): Promise<{ ok: true; body: string } | { ok: false; error: string }> => {
    const access = await loadAccess(context.userId);
    if (!access.canOutreach) {
      return { ok: false, error: "Pitch writer is on the full desk. Unlock $5." };
    }
    if (!process.env.XAI_API_KEY) {
      return { ok: false, error: "AI writing is not available right now." };
    }
    const sql = await getSql();
    const rows = await sql.query<{
      name: string;
      company: string;
      role_title: string;
      contact: string;
      source: string;
      why: string;
      angle: string;
      next_action: string;
      notes: string;
      post_url: string;
      post_quote: string;
      service_name: string | null;
      rate_label: string | null;
    }>(
      `select l.name, l.company, l.role_title, l.contact, l.source, l.why, l.angle,
              l.next_action, l.notes, l.post_url, l.post_quote,
              s.name as service_name, s.rate_label
       from leads l
       left join services s on s.id = l.service_id and s.user_id = l.user_id
       where l.id = $1 and l.user_id = $2
       limit 1`,
      [data.leadId, context.userId],
    );
    const lead = rows[0];
    if (!lead) return { ok: false, error: "Lead not found" };

    const limits: Record<ChannelId, string> = {
      dm: "Max 70 words. No subject line. Feels like a human DM.",
      email: "Max 120 words. First line is a subject, then a blank line, then the body.",
      proposal: "Max 160 words. Upwork/Fiverr style: first sentence is the outcome, then process, then a question.",
      post: "Max 50 words. Public reply under their post. Helpful, not salesy. Reference what they asked in the post.",
    };

    const system = `You write outreach for a Louisville-based multi-skilled creator (producer, engineer, designer, frontend).
Voice: direct, specific, calm. No hype. No em dash. No "I hope this finds you well". No "just circling back".
Never dump a full catalog. One offer, one proof, one next step.
Return ONLY valid JSON: {"body":"..."} `;

    const user = `Channel: ${data.channel}. ${limits[data.channel]}
Lead: ${lead.name}${lead.company ? ` at ${lead.company}` : ""}${lead.role_title ? `, ${lead.role_title}` : ""}
Contact/source: ${lead.contact || lead.source}
Source post: ${lead.post_url || "none"}
What they posted: ${lead.post_quote || "unknown"}
Offer: ${lead.service_name ?? "best matching skill"} ${lead.rate_label ? `(${lead.rate_label})` : ""}
Why they might buy: ${lead.why || "unknown"}
Angle: ${lead.angle || "lead with a sample"}
Next action on file: ${lead.next_action || "none"}
Notes: ${lead.notes || "none"}
${data.extra?.trim() ? `Writer notes: ${data.extra.trim()}` : ""}`;

    try {
      const text = await chat(system, user, 700);
      const parsed = extractJson(text) as { body?: unknown };
      const body = String(parsed.body ?? "").trim();
      if (!body) return { ok: false, error: "Writer returned nothing." };
      return { ok: true, body };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Write failed";
      return { ok: false, error: message };
    }
  });
