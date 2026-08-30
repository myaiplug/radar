import { Link } from "@tanstack/react-router";
import { formatUsd, sourceLabel, type Lead } from "@/lib/radar/types";
import { isDue, stageTone } from "@/lib/radar/ui";
import { SourcePost } from "./post-link";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

export function LeadCard({ lead }: { lead: Lead }) {
  const due = isDue(lead.followUpOn, lead.stage);
  return (
    <div className="grid gap-1">
      <Link to="/leads/$id" params={{ id: String(lead.id) }} className="block">
        <Card className="rounded-lg p-3 transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.16)]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{lead.name}</p>
              <p className="truncate text-xs text-muted">
                {lead.company || lead.roleTitle || sourceLabel(lead.source)}
              </p>
            </div>
            <Badge tone={lead.locked ? "danger" : stageTone(lead.stage)}>{lead.score}</Badge>
          </div>
          {lead.locked ? (
            <p className="mt-2 text-xs text-warn">Went dark. Unlock to bring the post back.</p>
          ) : lead.postQuote ? (
            <p className="mt-2 line-clamp-2 text-xs text-muted">“{lead.postQuote}”</p>
          ) : null}
          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-subtle">
            <span className="truncate">{lead.serviceName ?? "Unassigned"}</span>
            <span className="tabular-nums">{formatUsd(lead.valueUsd)}</span>
          </div>
          {due && !lead.locked ? (
            <p className="mt-2 text-xs text-warn">Follow up {lead.followUpOn}</p>
          ) : !lead.locked && lead.nextAction ? (
            <p className="mt-2 truncate text-xs text-muted">{lead.nextAction}</p>
          ) : null}
        </Card>
      </Link>
      {!lead.locked && lead.postUrl ? <SourcePost url={lead.postUrl} compact className="px-1" /> : null}
    </div>
  );
}
