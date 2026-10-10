import { clientEnv } from "@/lib/env/client";

export type SupabaseConfig = { url: string; publishableKey: string };

// Null when the project URL and publishable key are not set, which is only
// possible in local/test (staging and production fail the build without them).
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && publishableKey ? { url, publishableKey } : null;
}

export function requireSupabaseConfig(): SupabaseConfig {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return config;
}
