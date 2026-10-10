import {
  InboxIcon,
  LockIcon,
  type LucideIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type StateViewProps = {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  role?: "alert" | "status";
  className?: string;
};

function StateView({
  icon: Icon,
  title,
  description,
  action,
  role,
  className,
}: StateViewProps) {
  return (
    <div
      role={role}
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <Icon
        aria-hidden
        className="size-5 text-muted-foreground"
        strokeWidth={1.75}
      />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type Common = Omit<StateViewProps, "icon" | "role" | "title"> & {
  title?: string;
};

export function EmptyState({
  title = "Nothing here yet",
  icon = InboxIcon,
  ...props
}: Common & { icon?: LucideIcon }) {
  return <StateView icon={icon} title={title} {...props} />;
}

// Errors say what happened, what to do, and carry a reference ID for support.
export function ErrorState({
  title = "Something went wrong",
  description = "Try again. If it keeps happening, contact an administrator.",
  referenceId,
  ...props
}: Common & { referenceId?: string }) {
  return (
    <StateView
      icon={TriangleAlertIcon}
      role="alert"
      title={title}
      description={
        <>
          {description}
          {referenceId ? (
            <span className="mt-2 block font-mono text-xs">
              Reference: {referenceId}
            </span>
          ) : null}
        </>
      }
      {...props}
    />
  );
}

// Deliberately generic: never reveals whether the hidden resource exists.
export function ForbiddenState({
  title = "You don't have access to this",
  description = "Ask an administrator if you think you should.",
  ...props
}: Common) {
  return (
    <StateView
      icon={LockIcon}
      title={title}
      description={description}
      {...props}
    />
  );
}
