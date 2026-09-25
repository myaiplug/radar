export const STAGES = [
  { id: "new", label: "New", hint: "Just spotted" },
  { id: "researching", label: "Research", hint: "Figuring the angle" },
  { id: "pitched", label: "Pitched", hint: "Outreach sent" },
  { id: "negotiating", label: "Talks", hint: "Live conversation" },
  { id: "won", label: "Booked", hint: "Money in motion" },
  { id: "lost", label: "Dead", hint: "Closed cold" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

export const STAGE_IDS = STAGES.map((s) => s.id);

export const SOURCES = [
  { id: "hunt", label: "Radar hunt" },
  { id: "x", label: "X" },
  { id: "reddit", label: "Reddit" },
  { id: "upwork", label: "Upwork" },
  { id: "fiverr", label: "Fiverr" },
  { id: "instagram", label: "Instagram" },
  { id: "local", label: "Local" },
  { id: "referral", label: "Referral" },
  { id: "email", label: "Email" },
  { id: "manual", label: "Manual" },
  { id: "other", label: "Other" },
] as const;

export type SourceId = (typeof SOURCES)[number]["id"];

export const CATEGORIES = [
  { id: "audio", label: "Audio" },
  { id: "visual", label: "Visual" },
  { id: "words", label: "Words" },
  { id: "code", label: "Code & AI" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CHANNELS = [
  { id: "dm", label: "Cold DM" },
  { id: "email", label: "Email" },
  { id: "proposal", label: "Proposal" },
  { id: "post", label: "Public reply" },
] as const;

export type ChannelId = (typeof CHANNELS)[number]["id"];

export type Service = {
  id: number;
  slug: string;
  name: string;
  category: CategoryId;
  blurb: string;
  rateLabel: string;
  huntHint: string;
  sortOrder: number;
  active: boolean;
};

export type Lead = {
  id: number;
  name: string;
  company: string;
  roleTitle: string;
  contact: string;
  source: string;
  serviceId: number | null;
  serviceName: string | null;
  stage: StageId;
  valueUsd: number;
  score: number;
  why: string;
  angle: string;
  nextAction: string;
  followUpOn: string | null;
  notes: string;
  postUrl: string;
  postQuote: string;
  createdAt: string;
  updatedAt: string;
  locked: boolean;
};

export type Draft = {
  id: number;
  leadId: number;
  channel: ChannelId;
  body: string;
  createdAt: string;
};

export type LeadInput = {
  name: string;
  company?: string;
  roleTitle?: string;
  contact?: string;
  source?: string;
  serviceId?: number | null;
  stage?: StageId;
  valueUsd?: number;
  score?: number;
  why?: string;
  angle?: string;
  nextAction?: string;
  followUpOn?: string | null;
  notes?: string;
  postUrl?: string;
  postQuote?: string;
};

export type Prospect = {
  name: string;
  company: string;
  role: string;
  contact: string;
  source: SourceId;
  why: string;
  angle: string;
  estimatedValue: number;
  nextAction: string;
  score: number;
  postUrl: string;
  postQuote: string;
  hoursAgo: number | null;
};

export type ThreadReply = {
  author: string;
  text: string;
  url: string;
};

export type ThreadPeek = {
  quote: string;
  stillOpen: boolean;
  note: string;
  replies: ThreadReply[];
};

export type DeskStats = {
  openCount: number;
  dueCount: number;
  bookedCount: number;
  pipelineUsd: number;
  bookedUsd: number;
  byStage: { stage: StageId; count: number }[];
};

export type DeskAccess = {
  plan: "tease" | "unlocked";
  paymentsReady: boolean;
  huntsUsed: number;
  huntsLeft: number;
  savedCount: number;
  savesLeft: number;
  holdEndsAt: string | null;
  holdMsLeft: number | null;
  dark: boolean;
  canHunt: boolean;
  canSave: boolean;
  canOutreach: boolean;
  canInspect: boolean;
};

export const HUNT_WINDOWS = [
  { hours: 48, label: "Last 48 hours" },
  { hours: 168, label: "This week" },
] as const;

export function freshLabel(hoursAgo: number | null): string {
  if (hoursAgo == null) return "Live";
  if (hoursAgo < 1) return "Just now";
  if (hoursAgo < 24) return `${Math.max(1, hoursAgo)}h ago`;
  const days = Math.round(hoursAgo / 24);
  if (days <= 1) return "Yesterday";
  return `${days}d ago`;
}

export const UNLOCK_CENTS = 500;
export const UNLOCK_LABEL = "$5";
export const FREE_HUNTS = 1;
export const FREE_SAVES = 2;
export const HOLD_MS = 48 * 60 * 60 * 1000;

export function isStageId(value: string): value is StageId {
  return (STAGE_IDS as string[]).includes(value);
}

export function stageLabel(id: string): string {
  return STAGES.find((s) => s.id === id)?.label ?? id;
}

export function sourceLabel(id: string): string {
  return SOURCES.find((s) => s.id === id)?.label ?? id;
}

export function formatUsd(value: number): string {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatHold(ms: number): string {
  if (ms <= 0) return "gone";
  const totalMin = Math.floor(ms / 60000);
  const d = Math.floor(totalMin / (60 * 24));
  const h = Math.floor((totalMin - d * 60 * 24) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${Math.max(1, m)}m`;
}
