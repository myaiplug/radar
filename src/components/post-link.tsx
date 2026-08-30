import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useThreadPeek } from "@/lib/radar/hooks";
import { displayUrl, postLabel } from "@/lib/radar/url";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function SourcePost({
  url,
  quote,
  className,
  compact = false,
  inspectable = false,
  onQuote,
}: {
  url: string;
  quote?: string;
  className?: string;
  compact?: boolean;
  inspectable?: boolean;
  onQuote?: (quote: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const peek = useThreadPeek();

  if (!url) return null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const result = peek.data && peek.data.ok ? peek.data.peek : null;
  const error = peek.data && !peek.data.ok ? peek.data.error : peek.error?.message;

  if (compact) {
    return (
      <div className={cn("flex min-w-0 items-center gap-1", className)}>
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          title={url}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-1.5 text-steel hover:text-fg"
        >
          <ExternalLink className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate font-mono text-xs">{displayUrl(url)}</span>
        </a>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="inline-flex size-11 shrink-0 items-center justify-center text-steel hover:text-fg"
          aria-label={copied ? "Copied" : "Copy link"}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("grid min-w-0 gap-2", className)}>
      {quote ? <p className="text-sm text-muted">“{quote}”</p> : null}
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        title={url}
        className="flex min-h-11 min-w-0 items-center gap-2 text-steel hover:text-fg"
      >
        <ExternalLink className="size-3.5 shrink-0" strokeWidth={1.75} />
        <span className="truncate font-mono text-xs">{displayUrl(url)}</span>
      </a>
      <div className="flex flex-wrap items-center gap-1">
        <Button asChild size="sm" variant="outline">
          <a href={url} target="_blank" rel="noreferrer noopener">
            {postLabel(url)}
          </a>
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => void copyLink()}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        {inspectable ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={peek.isPending}
            onClick={() =>
              peek.mutate(url, {
                onSuccess: (res) => {
                  if (res.ok && res.peek.quote) onQuote?.(res.peek.quote);
                },
              })
            }
          >
            {peek.isPending ? "Reading thread" : "Check replies"}
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {result ? (
        <div className="grid gap-2 rounded-lg bg-elevated p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={result.stillOpen ? "ok" : "danger"}>
              {result.stillOpen ? "Still open" : "Looks closed"}
            </Badge>
            <span className="text-xs text-subtle">{result.replies.length} other replies</span>
          </div>
          {result.note ? <p className="text-xs text-muted">{result.note}</p> : null}
          {result.replies.length === 0 ? (
            <p className="text-xs text-subtle">No other replies found on this post.</p>
          ) : (
            <ul className="grid gap-2">
              {result.replies.map((reply, index) => (
                <li key={`${reply.author}-${index}`} className="min-w-0">
                  <p className="text-xs font-medium text-fg">{reply.author}</p>
                  <p className="text-xs text-muted">{reply.text}</p>
                  {reply.url ? (
                    <a
                      href={reply.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-1 inline-flex min-h-11 items-center text-xs text-steel hover:text-fg"
                    >
                      Open this reply
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
