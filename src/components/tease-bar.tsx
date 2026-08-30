import { useEffect, useState } from "react";
import { useAccess } from "@/lib/radar/hooks";
import { formatHold } from "@/lib/radar/types";
import { UnlockButton } from "./unlock-button";

export function TeaseBar() {
  const { data: access } = useAccess();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!access || access.plan === "unlocked" || !access.holdEndsAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [access]);

  if (!access || access.plan === "unlocked") return null;

  const left = access.holdEndsAt ? Math.max(0, Date.parse(access.holdEndsAt) - now) : null;
  const dark = access.dark || (left !== null && left <= 0);

  let copy = "First hunt is free. Two leads held 48 hours. Then they go dark.";
  if (dark) {
    copy = "Your leads went dark. $5 brings the posts and contacts back.";
  } else if (left !== null) {
    copy = `${access.savedCount} name${access.savedCount === 1 ? "" : "s"} on the clock · dark in ${formatHold(left)}`;
  } else if (access.huntsUsed > 0) {
    copy = "Free hunt is spent. Park 2 leads before they walk.";
  }

  return (
    <div className="border-b border-border bg-elevated">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="text-sm text-fg">{copy}</p>
        <UnlockButton size="sm" label={dark ? "Bring them back $5" : "Keep them $5"} />
      </div>
    </div>
  );
}
