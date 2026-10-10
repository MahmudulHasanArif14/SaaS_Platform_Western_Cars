"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/lib/authorization";
import {
  LOGIN_PATH,
  RESET_PASSWORD_PATH,
  SIGNED_IN_HOME_PATH,
} from "@/lib/routes";
import { safeNextPath } from "@/lib/security/redirect";
import {
  forgotPasswordSchema,
  newPasswordSchema,
  signInSchema,
} from "@/modules/auth/auth.schema";
import {
  type AuthFailure,
  requestPasswordReset,
  signIn,
  signOut,
  updatePassword,
} from "@/modules/auth/auth.service";

export type FormState = {
  // Shown above the form.
  message?: string;
  fieldErrors?: Record<string, string>;
  // Echoed back so the field keeps its value. Never a password.
  email?: string;
  done?: boolean;
};

const MESSAGES: Record<AuthFailure, string> = {
  not_configured: "Sign-in isn't set up in this environment.",
  invalid_credentials: "The email or password is incorrect.",
  rate_limited: "Too many attempts. Wait a few minutes and try again.",
  weak_password:
    "That password is too easy to guess or has appeared in a data breach. Choose another.",
  same_password: "Choose a password you haven't used for this account.",
  reauthentication_needed:
    "Your session is too old to change the password. Sign in again and retry.",
  unavailable: "We couldn't reach the sign-in service. Try again.",
};

function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return errors;
}

const text = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

export async function signInAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = text(formData.get("email"));
  const parsed = signInSchema.safeParse({
    email,
    password: text(formData.get("password")),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), email };
  }

  const result = await signIn(parsed.data);
  if (!result.ok) return { message: MESSAGES[result.reason], email };

  redirect(safeNextPath(formData.get("next"), SIGNED_IN_HOME_PATH));
}

export async function forgotPasswordAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = text(formData.get("email"));
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error), email };
  }

  const result = await requestPasswordReset(parsed.data.email);
  if (!result.ok) return { message: MESSAGES[result.reason], email };

  // Same answer whether or not the address has an account.
  return { done: true };
}

export async function resetPasswordAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await getCurrentUser())) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent(RESET_PASSWORD_PATH)}`);
  }

  const parsed = newPasswordSchema.safeParse({
    password: text(formData.get("password")),
    confirmPassword: text(formData.get("confirmPassword")),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const result = await updatePassword(parsed.data.password);
  if (!result.ok) return { message: MESSAGES[result.reason] };

  redirect(`${SIGNED_IN_HOME_PATH}?password=updated`);
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect(LOGIN_PATH);
}
