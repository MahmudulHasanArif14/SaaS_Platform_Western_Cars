import { cn } from "@/lib/utils";

// Tone carries meaning only for verified states. Pending is always neutral,
// never success (design brief §1).
export type StatusTone = "success" | "warning" | "danger" | "pending" | "info";

const DOT: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  pending: "bg-info",
  info: "bg-primary",
};

// Dot + text: the label states the status, the colour only reinforces it.
export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      data-tone={tone}
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md border bg-surface px-2 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-2 rounded-full",
          DOT[tone],
          tone === "pending" && "bg-transparent ring-2 ring-info ring-inset",
        )}
      />
      {children}
    </span>
  );
}
