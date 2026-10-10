import { describe, expect, it } from "vitest";

import { isProtectedPath, isSignedOutOnlyPath } from "@/lib/routes";

describe("isProtectedPath", () => {
  it.each([
    "/account",
    "/account/",
    "/account/settings",
    "/Account",
    "/acc%6Funt",
    "/reset-password",
  ])("protects %s", (pathname) => {
    expect(isProtectedPath(pathname)).toBe(true);
  });

  it.each([
    "/",
    "/login",
    "/forgot-password",
    "/auth/confirm",
    "/accounts",
    "/x/account",
    "/%E0%A4%A",
  ])("leaves %s public", (pathname) => {
    expect(isProtectedPath(pathname)).toBe(false);
  });
});

describe("isSignedOutOnlyPath", () => {
  it.each(["/login", "/forgot-password", "/LOGIN"])("matches %s", (path) => {
    expect(isSignedOutOnlyPath(path)).toBe(true);
  });

  it.each(["/", "/account", "/reset-password", "/login-help"])(
    "does not match %s",
    (path) => {
      expect(isSignedOutOnlyPath(path)).toBe(false);
    },
  );
});
