"use client";

import { CircleAlertIcon } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import type { FormState } from "./actions";

type AuthFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel: string;
  // Shown before any submission, e.g. an expired-link notice.
  initialMessage?: string;
  disabled?: boolean;
  // Replaces the form once the action reports `done`.
  doneContent?: React.ReactNode;
  children: (state: FormState) => React.ReactNode;
};

export function AuthForm({
  action,
  submitLabel,
  pendingLabel,
  initialMessage,
  disabled,
  doneContent,
  children,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    message: initialMessage,
  });

  if (state.done && doneContent) return doneContent;

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state.message ? (
        <p
          role="alert"
          className="flex gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm"
        >
          <CircleAlertIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-danger"
          />
          {state.message}
        </p>
      ) : null}
      {children(state)}
      <Button
        type="submit"
        size="lg"
        className="h-10 w-full"
        disabled={disabled || pending}
      >
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
