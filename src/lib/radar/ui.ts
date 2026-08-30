import type { StageId } from "./types";

export function stageTone(stage: StageId): "muted" | "steel" | "fg" | "warn" | "ok" | "danger" {
  switch (stage) {
    case "researching":
      return "steel";
    case "pitched":
      return "fg";
    case "negotiating":
      return "warn";
    case "won":
      return "ok";
    case "lost":
      return "danger";
    default:
      return "muted";
  }
}

export function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function isDue(date: string | null, stage: StageId): boolean {
  if (!date) return false;
  if (stage === "won" || stage === "lost") return false;
  return date <= todayIso();
}
