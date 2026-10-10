import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { serverEnv } from "@/lib/env/server";

import { requireSupabaseConfig } from "./config";
import { sessionCookieOptions } from "./cookies";

const secureCookies =
  serverEnv.APP_ENV === "staging" || serverEnv.APP_ENV === "production";

// Per-request client acting as the signed-in user (publishable key + RLS).
// For Server Components, Server Actions and Route Handlers.
export async function createClient() {
  const { url, publishableKey } = requireSupabaseConfig();
  // The auth client reads the clock as soon as it is created, which Next.js
  // only allows once the render is tied to a request.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(
              name,
              value,
              sessionCookieOptions(options, secureCookies),
            );
          }
        } catch {
          // Server Components cannot write cookies. The proxy refreshes the
          // session, so this is safe to ignore there.
        }
      },
    },
  });
}
