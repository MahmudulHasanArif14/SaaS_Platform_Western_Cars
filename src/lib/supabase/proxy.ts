import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

import { serverEnv } from "@/lib/env/server";

import { getSupabaseConfig } from "./config";
import { sessionCookieOptions } from "./cookies";

type CookieToSet = Parameters<
  NonNullable<
    NonNullable<Parameters<typeof createServerClient>[2]["cookies"]>["setAll"]
  >
>[0][number];

export type SessionRefresh = {
  // Verified subject of the access token, or null when signed out.
  userId: string | null;
  // Copies refreshed cookies and their no-cache headers onto the response.
  applyTo(response: NextResponse): void;
};

const secureCookies =
  serverEnv.APP_ENV === "staging" || serverEnv.APP_ENV === "production";

// Refreshes an expired access token. Updated cookies are written to the
// request (so rendering sees them) and, through `applyTo`, to the response.
export async function refreshSession(
  request: NextRequest,
): Promise<SessionRefresh> {
  const config = getSupabaseConfig();
  if (!config) return { userId: null, applyTo() {} };

  const cookiesToSet: CookieToSet[] = [];
  const cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies, headers) {
        for (const cookie of cookies) {
          request.cookies.set(cookie.name, cookie.value);
          cookiesToSet.push(cookie);
        }
        Object.assign(cacheHeaders, headers);
      },
    },
  });

  // Nothing may run between creating the client and getClaims(): it is the
  // call that refreshes the token.
  const { data } = await supabase.auth.getClaims();

  return {
    userId: data?.claims.sub ?? null,
    applyTo(response) {
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(
          name,
          value,
          sessionCookieOptions(options, secureCookies),
        );
      }
      for (const [key, value] of Object.entries(cacheHeaders)) {
        response.headers.set(key, value);
      }
    },
  };
}
