import { cn } from "@/lib/utils";

export function RadarMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      <circle cx="10" cy="22" r="1.6" fill="currentColor" />
      <path
        d="M10 22c4.2-4.2 9.4-4.8 14.2-2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M10 22c6.4-6.5 14.2-7.2 20.5-3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M10 22c8.6-8.8 18.8-9.4 26.5-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.28"
      />
    </svg>
  );
}
