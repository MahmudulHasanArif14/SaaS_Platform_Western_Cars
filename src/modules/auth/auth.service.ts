import "server-only";

import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

import type { EmailTokenInput, SignInInput } from "./auth.schema";

// Callers map these to user-facing text. Provider messages are never shown:
// they can reveal whether an account exists.
export type AuthFailure =
  | "not_configured"
  | "invalid_credentials"
  | "rate_limited"
  | "weak_password"
  | "same_password"
  | "reauthentication_needed"
  | "unavailable";

export type AuthResult = { ok: true } | { ok: false; reason: AuthFailure };

const ok: AuthResult = { ok: true };
const fail = (reason: AuthFailure): AuthResult => ({ ok: false, reason });

type ProviderError = { code?: string; status?: number };

function isRateLimited(error: ProviderError): boolean {
  return error.status === 429 || (error.code?.startsWith("over_") ?? false);
}

export async function signIn(input: SignInInput): Promise<AuthResult> {
  if (!getSupabaseConfig()) return fail("not_configured");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(input);
  if (!error) return ok;
  if (isRateLimited(error)) return fail("rate_limited");
  // 4xx covers wrong password, unknown email, unconfirmed and banned
  // accounts. All of them look the same to the caller.
  if (error.status && error.status >= 400 && error.status < 500) {
    return fail("invalid_credentials");
  }
  return fail("unavailable");
}

export async function signOut(): Promise<void> {
  if (!getSupabaseConfig()) return;
  const supabase = await createClient();
  // Local scope: ends this session and clears its cookies.
  await supabase.auth.signOut({ scope: "local" });
}

// Resolves the same way whether or not the address has an account.
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!getSupabaseConfig()) return fail("not_configured");
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error && isRateLimited(error)) return fail("rate_limited");
  if (error && (!error.status || error.status >= 500)) {
    return fail("unavailable");
  }
  return ok;
}

// Exchanges an emailed token hash for a session (cookies are set on success).
export async function verifyEmailToken(
  input: EmailTokenInput,
): Promise<AuthResult> {
  if (!getSupabaseConfig()) return fail("not_configured");
  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    type: input.type,
    token_hash: input.tokenHash,
  });
  return error ? fail("invalid_credentials") : ok;
}

// Changes the signed-in user's password and ends their other sessions.
export async function updatePassword(password: string): Promise<AuthResult> {
  if (!getSupabaseConfig()) return fail("not_configured");
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (isRateLimited(error)) return fail("rate_limited");
    switch (error.code) {
      case "weak_password":
        return fail("weak_password");
      case "same_password":
        return fail("same_password");
      case "reauthentication_needed":
      case "session_not_found":
      case "session_expired":
        return fail("reauthentication_needed");
      default:
        return fail("unavailable");
    }
  }

  await supabase.auth.signOut({ scope: "others" });
  return ok;
}
