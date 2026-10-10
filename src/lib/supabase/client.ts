import { createBrowserClient } from "@supabase/ssr";

import { requireSupabaseConfig } from "./config";

// Browser client (publishable key). Session cookies are httpOnly, so this
// client is anonymous: it cannot read or refresh the user's session. Sign-in,
// sign-out and data access go through the server.
export function createClient() {
  const { url, publishableKey } = requireSupabaseConfig();
  return createBrowserClient(url, publishableKey);
}
