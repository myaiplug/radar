import { UnlockButton } from "./unlock-button";
import { Card } from "./ui/card";

export function UnlockCard({
  title,
  body,
}: {
  title?: string;
  body?: string;
}) {
  return (
    <Card className="rounded-xl p-5">
      <p className="text-xs font-medium tracking-[0.18em] text-steel uppercase">Full desk</p>
      <h2 className="mt-2 font-display text-3xl leading-none">{title ?? "Keep the names"}</h2>
      <p className="mt-3 max-w-xl text-sm text-muted">
        {body ??
          "Two leads on the free desk. They go dark in 48 hours. $5 once keeps every post, every hunt, and the pitch writer."}
      </p>
      <UnlockButton className="mt-5" label="Unlock $5" />
    </Card>
  );
}
