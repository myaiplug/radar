import { useEffect, useState } from "react";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Landing } from "@/components/landing";
import { deskOpened } from "@/lib/radar/open-desk";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function useOpened() {
  const [opened, setOpened] = useState(() =>
    typeof window !== "undefined" ? deskOpened() : false,
  );
  useEffect(() => {
    const sync = () => setOpened(deskOpened());
    sync();
    window.addEventListener("radar-open", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("radar-open", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return opened;
}

function AppLayout() {
  const opened = useOpened();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/" && !opened) return <Landing />;
  return <AppShell />;
}
