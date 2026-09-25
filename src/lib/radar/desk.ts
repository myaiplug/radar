import { CATALOG } from "./catalog";
import { huntFeed, type FeedFile } from "./match";
import { sanitizeUrl } from "./url";
import {
  CHANNELS,
  FREE_HUNTS,
  FREE_SAVES,
  HOLD_MS,
  STAGES,
  isStageId,
  type ChannelId,
  type DeskAccess,
  type DeskStats,
  type Draft,
  type Lead,
  type LeadInput,
  type Prospect,
  type Service,
  type StageId,
  type ThreadPeek,
} from "./types";

const KEY = "radar.desk.v1";

type Persisted = {
  nextId: number;
  services: Service[];
  leads: Lead[];
  drafts: Draft[];
  plan: "tease" | "unlocked";
  huntsUsed: number;
  teaseStartedAt: string | null;
};

function seed(): Persisted {
  return {
    nextId: 100,
    services: CATALOG.map((entry, index) => ({
      id: index + 1,
      slug: entry.slug,
      name: entry.name,
      category: entry.category,
      blurb: entry.blurb,
      rateLabel: entry.rateLabel,
      huntHint: entry.huntHint,
      sortOrder: index,
      active: true,
    })),
    leads: [],
    drafts: [],
    plan: "tease",
    huntsUsed: 0,
    teaseStartedAt: null,
  };
}

let memory: Persisted | null = null;

function load(): Persisted {
  if (typeof localStorage === "undefined") {
    memory ??= seed();
    return memory;
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const fresh = seed();
      localStorage.setItem(KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw) as Persisted;
    if (!parsed.services?.length) parsed.services = seed().services;
    parsed.leads ??= [];
    parsed.drafts ??= [];
    parsed.huntsUsed ??= 0;
    parsed.plan = parsed.plan === "unlocked" ? "unlocked" : "tease";
    return parsed;
  } catch {
    memory ??= seed();
    return memory;
  }
}

function save(state: Persisted) {
  memory = state;
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode — keep the in-memory desk */
  }
}

function accessOf(state: Persisted, now = Date.now()): DeskAccess {
  const unlocked = state.plan === "unlocked";
  const savedCount = state.leads.length;
  const started = state.teaseStartedAt ? Date.parse(state.teaseStartedAt) : NaN;
  const holdEndsAt =
    unlocked || !Number.isFinite(started) ? null : new Date(started + HOLD_MS).toISOString();
  const holdMsLeft = holdEndsAt ? Math.max(0, Date.parse(holdEndsAt) - now) : null;
  const dark = !unlocked && holdEndsAt !== null && (holdMsLeft ?? 0) <= 0;
  const huntsLeft = unlocked ? 99 : Math.max(0, FREE_HUNTS - state.huntsUsed);
  const savesLeft = unlocked ? 99 : Math.max(0, FREE_SAVES - savedCount);
  return {
    plan: unlocked ? "unlocked" : "tease",
    paymentsReady: false,
    huntsUsed: state.huntsUsed,
    huntsLeft,
    savedCount,
    savesLeft,
    holdEndsAt,
    holdMsLeft,
    dark,
    canHunt: unlocked || (huntsLeft > 0 && !dark),
    canSave: unlocked || (savesLeft > 0 && !dark),
    canOutreach: unlocked,
    canInspect: unlocked,
  };
}

function redact(lead: Lead, access: DeskAccess): Lead {
  if (!access.dark) return { ...lead, locked: false };
  return {
    ...lead,
    contact: "",
    postUrl: "",
    postQuote: "",
    why: "",
    angle: "",
    nextAction: "",
    notes: "",
    locked: true,
  };
}

function withServiceName(state: Persisted, lead: Lead): Lead {
  const service = state.services.find((item) => item.id === lead.serviceId);
  return { ...lead, serviceName: service?.name ?? lead.serviceName };
}

export function listServices(): Service[] {
  return load()
    .services.slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

export function updateService(input: {
  id: number;
  rateLabel?: string;
  active?: boolean;
  blurb?: string;
}): Service {
  const state = load();
  const service = state.services.find((item) => item.id === input.id);
  if (!service) throw new Error("Offer not found");
  if (input.rateLabel != null) service.rateLabel = input.rateLabel;
  if (input.blurb != null) service.blurb = input.blurb;
  if (input.active != null) service.active = input.active;
  save(state);
  return service;
}

export function getAccess(): DeskAccess {
  return accessOf(load());
}

export function listLeads(): Lead[] {
  const state = load();
  const access = accessOf(state);
  return state.leads
    .map((lead) => redact(withServiceName(state, lead), access))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function getLead(id: number): Lead | null {
  const state = load();
  const lead = state.leads.find((item) => item.id === id);
  if (!lead) return null;
  return redact(withServiceName(state, lead), accessOf(state));
}

function cleanLead(input: LeadInput, id: number, prev?: Lead): Lead {
  const name = input.name.trim();
  if (!name) throw new Error("Name is required");
  const now = new Date().toISOString();
  const stage = input.stage && isStageId(input.stage) ? input.stage : (prev?.stage ?? "new");
  return {
    id,
    name,
    company: input.company?.trim() ?? "",
    roleTitle: input.roleTitle?.trim() ?? "",
    contact: input.contact?.trim() ?? "",
    source: input.source?.trim() || "manual",
    serviceId: input.serviceId ?? null,
    serviceName: null,
    stage,
    valueUsd: Math.max(0, Math.round(input.valueUsd ?? 0)),
    score: Math.min(100, Math.max(0, Math.round(input.score ?? 50))),
    why: input.why?.trim() ?? "",
    angle: input.angle?.trim() ?? "",
    nextAction: input.nextAction?.trim() ?? "",
    followUpOn: input.followUpOn || null,
    notes: input.notes?.trim() ?? "",
    postUrl: sanitizeUrl(input.postUrl),
    postQuote: input.postQuote?.trim() ?? "",
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
    locked: false,
  };
}

export function createLead(input: LeadInput): Lead {
  const state = load();
  const access = accessOf(state);
  if (!access.canSave) {
    if (access.dark) throw new Error("Your leads went dark. Unlock the desk to bring them back.");
    throw new Error("Free desk holds 2 leads. Unlock the desk to keep the rest.");
  }
  const lead = withServiceName(state, cleanLead(input, state.nextId));
  state.nextId += 1;
  state.leads.unshift(lead);
  if (!state.teaseStartedAt && state.plan !== "unlocked") {
    state.teaseStartedAt = new Date().toISOString();
  }
  save(state);
  return lead;
}

export function updateLead(input: LeadInput & { id: number }): Lead | null {
  const state = load();
  const access = accessOf(state);
  if (access.dark) throw new Error("Your leads went dark. Unlock the desk to edit them.");
  const index = state.leads.findIndex((item) => item.id === input.id);
  if (index < 0) return null;
  const lead = withServiceName(state, cleanLead(input, input.id, state.leads[index]));
  state.leads[index] = lead;
  save(state);
  return lead;
}

export function setLeadStage(input: { id: number; stage: StageId }): { ok: true } {
  if (!isStageId(input.stage)) throw new Error("Invalid stage");
  const state = load();
  const access = accessOf(state);
  if (access.dark) throw new Error("Your leads went dark. Unlock the desk to move them.");
  const lead = state.leads.find((item) => item.id === input.id);
  if (!lead) throw new Error("Lead not found");
  lead.stage = input.stage;
  lead.updatedAt = new Date().toISOString();
  save(state);
  return { ok: true };
}

export function deleteLead(id: number): { ok: true } {
  const state = load();
  state.leads = state.leads.filter((item) => item.id !== id);
  state.drafts = state.drafts.filter((item) => item.leadId !== id);
  save(state);
  return { ok: true };
}

export function getDeskStats(): DeskStats {
  const state = load();
  const byStage = STAGES.map((stage) => ({
    stage: stage.id,
    count: state.leads.filter((lead) => lead.stage === stage.id).length,
  }));
  const openCount = byStage
    .filter((stage) => stage.stage !== "won" && stage.stage !== "lost")
    .reduce((sum, stage) => sum + stage.count, 0);
  const today = new Date().toISOString().slice(0, 10);
  const dueCount = state.leads.filter(
    (lead) =>
      lead.followUpOn &&
      lead.followUpOn <= today &&
      lead.stage !== "won" &&
      lead.stage !== "lost",
  ).length;
  return {
    openCount,
    dueCount,
    bookedCount: byStage.find((stage) => stage.stage === "won")?.count ?? 0,
    pipelineUsd: state.leads
      .filter((lead) => lead.stage !== "won" && lead.stage !== "lost")
      .reduce((sum, lead) => sum + lead.valueUsd, 0),
    bookedUsd: state.leads
      .filter((lead) => lead.stage === "won")
      .reduce((sum, lead) => sum + lead.valueUsd, 0),
    byStage,
  };
}

export function listDrafts(leadId: number): Draft[] {
  const state = load();
  if (!accessOf(state).canOutreach) return [];
  return state.drafts
    .filter((draft) => draft.leadId === leadId)
    .sort((a, b) => b.id - a.id);
}

export function saveDraft(input: { leadId: number; channel: ChannelId; body: string }): Draft {
  const state = load();
  if (!accessOf(state).canOutreach) {
    throw new Error("Pitch writer is on the full desk. Unlock the desk.");
  }
  const body = input.body.trim();
  if (!body) throw new Error("Draft is empty");
  const channel = CHANNELS.some((item) => item.id === input.channel) ? input.channel : "dm";
  const draft: Draft = {
    id: state.nextId,
    leadId: input.leadId,
    channel,
    body,
    createdAt: new Date().toISOString(),
  };
  state.nextId += 1;
  state.drafts.unshift(draft);
  save(state);
  return draft;
}

let feedCache: FeedFile | null = null;

async function loadFeed(): Promise<FeedFile> {
  if (feedCache) return feedCache;
  const url = `${import.meta.env.BASE_URL}feed.json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("The public post feed is missing.");
  const file = (await response.json()) as FeedFile;
  file.posts ??= [];
  feedCache = file;
  return file;
}

export async function runHunt(input: {
  serviceIds: number[];
  niche: string;
  geo: string;
  notes: string;
  windowHours?: number;
}): Promise<
  | { ok: true; prospects: Prospect[]; windowHours: number; widened: boolean }
  | { ok: false; error: string }
> {
  const state = load();
  const access = accessOf(state);
  if (!access.canHunt) {
    if (access.dark) return { ok: false, error: "Your leads went dark. Unlock the desk to hunt again." };
    return { ok: false, error: "Free hunt is used. Unlock the desk for unlimited hunts." };
  }
  const chosen = input.serviceIds.filter((id) => Number.isFinite(id));
  const services = (
    chosen.length
      ? state.services.filter((service) => chosen.includes(service.id))
      : state.services.filter((service) => service.active).slice(0, 4)
  );
  if (services.length === 0) return { ok: false, error: "Turn on at least one offer first." };

  let feed: FeedFile;
  try {
    feed = await loadFeed();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load posts";
    return { ok: false, error: message };
  }

  const result = huntFeed({
    posts: feed.posts,
    services,
    niche: input.niche.trim() || "independent artists, small labels, local brands, and founders",
    geo: input.geo.trim() || "Louisville, KY plus remote US",
    notes: input.notes.trim(),
    windowHours: input.windowHours === 168 ? 168 : 48,
  });
  if ("error" in result) return { ok: false, error: result.error };

  if (state.plan !== "unlocked") {
    state.huntsUsed += 1;
    state.teaseStartedAt ??= new Date().toISOString();
    save(state);
  }
  return { ok: true, ...result };
}

export async function inspectThread(input: {
  postUrl: string;
}): Promise<{ ok: true; peek: ThreadPeek } | { ok: false; error: string }> {
  const access = accessOf(load());
  if (!access.canInspect) {
    return { ok: false, error: "Reply check is on the full desk. Unlock the desk." };
  }
  const postUrl = sanitizeUrl(input.postUrl);
  if (!postUrl) return { ok: false, error: "Need a direct post or job URL first." };
  let feed: FeedFile | null = null;
  try {
    feed = await loadFeed();
  } catch {
    feed = null;
  }
  const post = feed?.posts.find((item) => item.url === postUrl);
  const blob = `${post?.title ?? ""} ${post?.text ?? ""}`.toLowerCase();
  const closed = /\[closed\]|\[hired\]|position filled|no longer looking|already hired/.test(blob);
  return {
    ok: true,
    peek: {
      quote: post?.text?.trim() || post?.title || "",
      stillOpen: !closed,
      note: post
        ? "This is the post text saved with the public feed. Open the permalink for replies."
        : "This desk does not load reply threads in the browser. Open the permalink.",
      replies: [],
    },
  };
}

function offerLine(service: Service | undefined): string {
  if (!service) return "the work on your post";
  return `${service.name.toLowerCase()} (${service.rateLabel})`;
}

export function writeOutreach(input: {
  leadId: number;
  channel: ChannelId;
  extra?: string;
}): { ok: true; body: string } | { ok: false; error: string } {
  const state = load();
  if (!accessOf(state).canOutreach) {
    return { ok: false, error: "Pitch writer is on the full desk. Unlock the desk." };
  }
  const lead = state.leads.find((item) => item.id === input.leadId);
  if (!lead) return { ok: false, error: "Lead not found" };
  const service = state.services.find((item) => item.id === lead.serviceId);
  const quote = (lead.postQuote || lead.why || "your post").replace(/\s+/g, " ").trim().slice(0, 220);
  const extra = input.extra?.trim() ? `\n${input.extra.trim()}` : "";
  const offer = offerLine(service);
  const heard = `I saw this: “${quote}”`;
  let body: string;
  if (input.channel === "email") {
    body = `Subject: ${service?.name ?? "Help"} for ${lead.name}\n\n${lead.name},\n\n${heard}.\n\nI do ${service?.blurb ?? offer}.${extra}\n\n${lead.angle || service?.huntHint || ""}\n\nIf that is still open, send the files and the date you need them.`;
  } else if (input.channel === "proposal") {
    body = `Proposal — ${service?.name ?? "Freelance"}\n\nFor: ${lead.name}${lead.company ? `, ${lead.company}` : ""}\nSource: ${lead.postUrl || "direct"}\n\nWhat I heard: ${quote}\n\nWhat I would do: ${(service?.blurb ?? lead.angle) || "A scoped pass on the posted ask."}\n\nRange: ${service?.rateLabel || "after I see the files"}\nNext: ${lead.nextAction || "Send files and a deadline."}${extra}`;
  } else if (input.channel === "post") {
    body = `${lead.name} — ${heard}.\n\nI can take the ${offer} pass. ${lead.nextAction || "Happy to start from a short sample."}${extra}`;
  } else {
    body = `${lead.name} — ${heard}.\n\nI handle ${offer}. ${service?.blurb ?? ""}${extra}\n\n${lead.nextAction || "If it is still open, send the files."}`;
  }
  return { ok: true, body: body.replace(/\n{3,}/g, "\n\n").trim() };
}

export function startCheckout():
  | { ok: true; url: string }
  | { ok: true; unlocked: true }
  | { ok: false; error: string } {
  const state = load();
  if (state.plan === "unlocked") return { ok: true, unlocked: true };
  state.plan = "unlocked";
  save(state);
  return { ok: true, unlocked: true };
}

export function confirmCheckout(_input: { sessionId: string }): { ok: true } | { ok: false; error: string } {
  const state = load();
  state.plan = "unlocked";
  save(state);
  return { ok: true };
}
