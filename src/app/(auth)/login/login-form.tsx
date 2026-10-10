"use client";

import { FormField } from "@/components/form-field";

import { signInAction } from "../actions";
import { AuthForm } from "../auth-form";

export function LoginForm({
  next,
  disabled,
}: {
  next?: string;
  disabled?: boolean;
}) {
  return (
    <AuthForm
      action={signInAction}
      submitLabel="Sign in"
      pendingLabel="Signing in…"
      disabled={disabled}
    >
      {(state) => (
        <>
          {next ? <input type="hidden" name="next" value={next} /> : null}
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
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            error={state.fieldErrors?.password}
          />
        </>
      )}
    </AuthForm>
  );
}
