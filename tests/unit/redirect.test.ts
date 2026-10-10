import { describe, expect, it } from "vitest";

import { safeNextPath } from "@/lib/security/redirect";

const FALLBACK = "/account";

describe("safeNextPath (SEC-A07)", () => {
  it.each([
    ["/account", "/account"],
    ["/org/acme/domains?tab=dns#records", "/org/acme/domains?tab=dns#records"],
    ["/a/../b", "/b"],
  ])("keeps the same-site path %s", (value, expected) => {
    expect(safeNextPath(value, FALLBACK)).toBe(expected);
  });

  it.each([
    "//evil.example",
    "///evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "https://evil.example/",
    "http://evil.example",
    "javascript:alert(1)",
    "data:text/html,x",
    "evil.example",
    "account",
    "",
    " /account",
    "/\tevil",
    "/\n/evil.example",
    "/%0a/evil.example\u0000",
  ])("rejects %j", (value) => {
    expect(safeNextPath(value, FALLBACK)).toBe(FALLBACK);
  });

  it.each([null, undefined, 42, ["/account"], {}])(
    "rejects the non-string %j",
    (value) => {
      expect(safeNextPath(value, FALLBACK)).toBe(FALLBACK);
    },
  );

  it.each(["/..//evil.example", "/.//evil.example", "/a/..//evil.example"])(
    "rejects %j, which normalises to a protocol-relative URL",
    (value) => {
      expect(safeNextPath(value, FALLBACK)).toBe(FALLBACK);
    },
  );
});
