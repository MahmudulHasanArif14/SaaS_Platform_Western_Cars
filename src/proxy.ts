import { type NextRequest, NextResponse } from "next/server";

import { isDevelopment } from "@/lib/env/runtime";
import { serverEnv } from "@/lib/env/server";
import { isPreviewRoute, NOT_FOUND_PATH } from "@/lib/preview-routes";
import {
  buildContentSecurityPolicy,
  generateNonce,
  NONCE_HEADER,
} from "@/lib/security/headers";

const CSP_HEADER = "Content-Security-Policy";

// A fresh nonce per request. Next.js reads it from the request CSP header and
// applies it to its own scripts; the root layout reads NONCE_HEADER.
export function proxy(request: NextRequest) {
  const nonce = generateNonce();
  const csp = buildContentSecurityPolicy({
    nonce,
    isDevelopment,
    upgradeInsecureRequests:
      serverEnv.APP_ENV === "staging" || serverEnv.APP_ENV === "production",
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set(CSP_HEADER, csp);

  // Routes render as a stream, so `notFound()` in a layout answers 200. The
  // status has to be decided here, before rendering starts.
  const blocked =
    serverEnv.APP_ENV === "production" &&
    isPreviewRoute(request.nextUrl.pathname);
  const init = { request: { headers: requestHeaders } };
  const response = blocked
    ? NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url), init)
    : NextResponse.next(init);
  response.headers.set(CSP_HEADER, csp);
  return response;
}

export const config = {
  // Prefetch requests are not excluded: a request header must not be able to
  // skip the route block above.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
