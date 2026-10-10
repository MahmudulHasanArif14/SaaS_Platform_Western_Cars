import "server-only";

import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/env/server";

import { requireSupabaseConfig } from "./config";

// Elevated client (secret key, bypasses RLS). TR-034: only for jobs, webhooks
// and explicit server operations, after application-level authorization.
// Never import from UI code (ESLint TR-001).
export function createAdminClient() {
  const { url } = requireSupabaseConfig();
  const secretKey = serverEnv.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Supabase is not configured: set SUPABASE_SECRET_KEY.");
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
