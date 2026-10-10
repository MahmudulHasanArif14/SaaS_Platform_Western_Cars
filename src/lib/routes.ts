export const LOGIN_PATH = "/login";
export const FORGOT_PASSWORD_PATH = "/forgot-password";
export const RESET_PASSWORD_PATH = "/reset-password";
export const AUTH_CONFIRM_PATH = "/auth/confirm";
// Where a signed-in user lands until organisations exist (T-107).
export const SIGNED_IN_HOME_PATH = "/account";

// Routes that need a session. The proxy redirects signed-out requests before
// rendering; each page still calls requireAuth() itself.
const PROTECTED_PREFIXES = [SIGNED_IN_HOME_PATH, RESET_PASSWORD_PATH];
// Routes a signed-in user is sent away from.
const SIGNED_OUT_ONLY_PREFIXES = [LOGIN_PATH, FORGOT_PASSWORD_PATH];

function matches(pathname: string, prefixes: readonly string[]): boolean {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    // Malformed escapes never match a route; compare the raw value.
  }
  path = path.toLowerCase();
  return prefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export const isProtectedPath = (pathname: string) =>
  matches(pathname, PROTECTED_PREFIXES);

export const isSignedOutOnlyPath = (pathname: string) =>
  matches(pathname, SIGNED_OUT_ONLY_PREFIXES);
