import { useId } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FormFieldProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
  label: string;
  description?: string;
  error?: string;
};

// Label, input, hint and error wired together for assistive technology.
export function FormField({
  label,
  description,
  error,
  className,
  ...props
}: FormFieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [descriptionId, errorId].filter(Boolean).join(" ") || undefined
        }
        className="h-10"
        {...props}
      />
      {description ? (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
