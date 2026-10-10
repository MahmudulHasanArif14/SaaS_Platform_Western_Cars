"use client";

import { FormField } from "@/components/form-field";

import { resetPasswordAction } from "../actions";
import { AuthForm } from "../auth-form";

export function ResetPasswordForm({
  email,
  minLength,
}: {
  email: string | null;
  minLength: number;
}) {
  return (
    <AuthForm
      action={resetPasswordAction}
      submitLabel="Save password"
      pendingLabel="Saving…"
    >
      {(state) => (
        <>
          {/* Lets password managers attach the new password to the account. */}
          <input
            type="email"
            name="username"
            autoComplete="username"
            value={email ?? ""}
            readOnly
            hidden
          />
          <FormField
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={minLength}
            description={`At least ${minLength} characters.`}
            error={state.fieldErrors?.password}
          />
          <FormField
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            error={state.fieldErrors?.confirmPassword}
          />
        </>
      )}
    </AuthForm>
  );
}
