import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { LOGIN_PATH } from "@/lib/routes";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AuthUser = { id: string; email: string | null };

// The signed-in user, from the verified access token (getClaims checks the
// JWT signature). Never use getSession() for this. Cached per request.
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  if (!getSupabaseConfig()) return null;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;

  const { sub, email } = data.claims;
  return { id: sub, email: typeof email === "string" ? email : null };
});

// For pages, Server Actions and data functions that need a signed-in user.
// `returnTo` is the path to come back to after signing in.
export async function requireAuth(returnTo?: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (user) return user;

  redirect(
    returnTo
      ? `${LOGIN_PATH}?next=${encodeURIComponent(returnTo)}`
      : LOGIN_PATH,
  );
}
