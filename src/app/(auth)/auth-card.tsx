import { InfoIcon } from "lucide-react";

type AuthCardProps = {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function AuthCard({
  title,
  description,
  footer,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
      {footer ? <p className="text-sm">{footer}</p> : null}
    </div>
  );
}

// Local and test builds can run without a Supabase project.
export function NotConfiguredNotice() {
  return (
    <p
      role="status"
      className="flex gap-2 rounded-lg border bg-surface-2 p-3 text-sm"
    >
      <InfoIcon
        aria-hidden
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
      Sign-in isn&apos;t set up in this environment. Set the Supabase variables
      listed in .env.example and restart.
    </p>
  );
}
