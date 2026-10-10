// Page pattern (design brief §4): title + status, description, primary action on the right.
export function PageHeader({
  title,
  description,
  status,
  actions,
}: {
  title: string;
  description?: string;
  status?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {status}
        </div>
        {description ? (
          <p className="max-w-prose text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function PageContainer({
  width = "table",
  children,
}: {
  width?: "table" | "form";
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        width === "form"
          ? "mx-auto w-full max-w-[880px] space-y-6 p-4 md:p-6"
          : "mx-auto w-full max-w-[1440px] space-y-6 p-4 md:p-6"
      }
    >
      {children}
    </div>
  );
}
