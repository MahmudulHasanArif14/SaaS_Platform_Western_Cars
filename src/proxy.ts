import { type NextRequest, NextResponse } from "next/server";

import { isDevelopment } from "@/lib/env/runtime";
import { serverEnv } from "@/lib/env/server";
import { isPreviewRoute, NOT_FOUND_PATH } from "@/lib/preview-routes";
import {
  isProtectedPath,
  isSignedOutOnlyPath,
  LOGIN_PATH,
  SIGNED_IN_HOME_PATH,
} from "@/lib/routes";
import {
  buildContentSecurityPolicy,
  generateNonce,
  NONCE_HEADER,
  supabaseConnectSources,
} from "@/lib/security/headers";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { refreshSession } from "@/lib/supabase/proxy";

const CSP_HEADER = "Content-Security-Policy";

// Runs before rendering on every request:
//  1. refreshes the Supabase session cookies (TR-020);
//  2. decides responses whose status must be set before streaming starts
//     (ISSUE-009) — these are a first gate, never the only one: pages and
//     data functions authorize again;
//  3. sets a fresh CSP nonce. Next.js reads it from the request CSP header
//     and the root layout reads NONCE_HEADER.
export async function proxy(request: NextRequest) {
  const session = await refreshSession(request);
  const { pathname, search } = request.nextUrl;

  const nonce = generateNonce();
  const csp = buildContentSecurityPolicy({
    nonce,
    isDevelopment,
    upgradeInsecureRequests:
      serverEnv.APP_ENV === "staging" || serverEnv.APP_ENV === "production",
    connectSources: supabaseConnectSources(getSupabaseConfig()?.url),
  });

  // Built after the refresh so the forwarded Cookie header is up to date.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set(CSP_HEADER, csp);
  const init = { request: { headers: requestHeaders } };

  let response: NextResponse;
  if (serverEnv.APP_ENV === "production" && isPreviewRoute(pathname)) {
    response = NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url), init);
  } else if (!session.userId && isProtectedPath(pathname)) {
    const login = new URL(LOGIN_PATH, request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    response = NextResponse.redirect(login);
  } else if (session.userId && isSignedOutOnlyPath(pathname)) {
    response = NextResponse.redirect(new URL(SIGNED_IN_HOME_PATH, request.url));
  } else {
    response = NextResponse.next(init);
  }

  session.applyTo(response);
  response.headers.set(CSP_HEADER, csp);
  return response;
}

export const config = {
  // Prefetch requests are not excluded: a request header must not be able to
  // skip the decisions above.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
