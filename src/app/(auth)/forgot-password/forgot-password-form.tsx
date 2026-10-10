"use client";

import { MailCheckIcon } from "lucide-react";

import { FormField } from "@/components/form-field";

import { forgotPasswordAction } from "../actions";
import { AuthForm } from "../auth-form";

export function ForgotPasswordForm({
  initialMessage,
  disabled,
}: {
  initialMessage?: string;
  disabled?: boolean;
}) {
  return (
    <AuthForm
      action={forgotPasswordAction}
      submitLabel="Send reset link"
      pendingLabel="Sending…"
      initialMessage={initialMessage}
      disabled={disabled}
      doneContent={
        <p
          role="status"
          className="flex gap-2 rounded-lg border bg-surface-2 p-3 text-sm"
        >
          <MailCheckIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          If that address has an account, a reset link is on its way. The link
          works once and expires in an hour.
        </p>
      }
    >
      {(state) => (
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          spellCheck={false}
          required
          defaultValue={state.email}
          error={state.fieldErrors?.email}
        />
      )}
    </AuthForm>
  );
}
