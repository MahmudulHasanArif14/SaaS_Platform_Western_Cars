import type { CookieOptions } from "@supabase/ssr";

// SEC-A04 / SEC-C03: session cookies are never readable from JavaScript.
// `secure` is off only for plain-http local development.
export function sessionCookieOptions(
  options: CookieOptions,
  secure: boolean,
): CookieOptions {
  return { ...options, httpOnly: true, sameSite: "lax", secure, path: "/" };
}
