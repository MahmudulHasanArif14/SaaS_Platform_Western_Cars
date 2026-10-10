import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  buildContentSecurityPolicy,
  generateNonce,
  SONNER_STYLE_HASHES,
  supabaseConnectSources,
  STATIC_SECURITY_HEADERS,
} from "@/lib/security/headers";
import { sessionCookieOptions } from "@/lib/supabase/cookies";

const production = {
  nonce: "abc123",
  isDevelopment: false,
  upgradeInsecureRequests: true,
};

const directive = (csp: string, name: string) =>
  csp.split("; ").find((part) => part.startsWith(`${name} `));

describe("buildContentSecurityPolicy", () => {
  it("allows scripts by nonce only in production", () => {
    const csp = buildContentSecurityPolicy(production);

    expect(directive(csp, "script-src")).toBe(
      "script-src 'self' 'nonce-abc123' 'strict-dynamic'",
    );
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("never allows inline scripts, in any mode", () => {
    for (const isDevelopment of [true, false]) {
      const csp = buildContentSecurityPolicy({ ...production, isDevelopment });
      expect(directive(csp, "script-src")).not.toContain("'unsafe-inline'");
    }
  });

  it("blocks framing, plugins, base hijacking and foreign form posts", () => {
    const csp = buildContentSecurityPolicy(production);

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it("relaxes eval and inline styles for the dev server only", () => {
    const csp = buildContentSecurityPolicy({
      ...production,
      isDevelopment: true,
    });

    expect(directive(csp, "script-src")).toContain("'unsafe-eval'");
    expect(directive(csp, "style-src")).toBe(
      "style-src 'self' 'unsafe-inline'",
    );
  });

  it("allows <style> elements by nonce or pinned hash, never unsafe-inline", () => {
    const csp = buildContentSecurityPolicy(production);

    expect(directive(csp, "style-src")).toBe("style-src 'self' 'nonce-abc123'");
    expect(directive(csp, "style-src-elem")).toBe(
      `style-src-elem 'self' 'nonce-abc123' ${SONNER_STYLE_HASHES.map((hash) => `'${hash}'`).join(" ")}`,
    );
    expect(directive(csp, "style-src-attr")).toBe(
      "style-src-attr 'unsafe-inline'",
    );
  });

  it("pins the stylesheet the installed sonner injects", () => {
    const source = readFileSync("node_modules/sonner/dist/index.mjs", "utf8");
    const literal = source.match(/^__insertCSS\((".*")\);?\s*$/m)?.[1];
    expect(literal, "sonner still injects its CSS inline").toBeDefined();

    const sha256 = (value: string) =>
      `sha256-${createHash("sha256").update(value).digest("base64")}`;
    expect([sha256(""), sha256(JSON.parse(literal!) as string)]).toEqual([
      ...SONNER_STYLE_HASHES,
    ]);
  });

  it("upgrades insecure requests only when asked", () => {
    expect(buildContentSecurityPolicy(production)).toContain(
      "upgrade-insecure-requests",
    );
    expect(
      buildContentSecurityPolicy({
        ...production,
        upgradeInsecureRequests: false,
      }),
    ).not.toContain("upgrade-insecure-requests");
  });

  it("produces a single-line header value", () => {
    expect(buildContentSecurityPolicy(production)).not.toMatch(/[\r\n]/);
  });
});

describe("generateNonce", () => {
  it("returns a fresh base64 value each time", () => {
    const nonces = new Set(Array.from({ length: 50 }, generateNonce));

    expect(nonces.size).toBe(50);
    for (const nonce of nonces) expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

describe("STATIC_SECURITY_HEADERS", () => {
  it("matches TRD §12", () => {
    expect(
      Object.fromEntries(STATIC_SECURITY_HEADERS.map((h) => [h.key, h.value])),
    ).toEqual({
      "Strict-Transport-Security":
        "max-age=63072000; includeSubDomains; preload",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(self), microphone=(self), geolocation=()",
      "X-Frame-Options": "DENY",
    });
  });
});

describe("supabaseConnectSources", () => {
  it("allows the project's API and Realtime origins only", () => {
    expect(supabaseConnectSources("https://abc.supabase.co/rest/v1")).toEqual([
      "https://abc.supabase.co",
      "wss://abc.supabase.co",
    ]);
    expect(supabaseConnectSources("http://127.0.0.1:54321")).toEqual([
      "http://127.0.0.1:54321",
      "ws://127.0.0.1:54321",
    ]);
    expect(supabaseConnectSources(undefined)).toEqual([]);
  });

  it("is added to connect-src and nowhere else", () => {
    const csp = buildContentSecurityPolicy({
      ...production,
      connectSources: supabaseConnectSources("https://abc.supabase.co"),
    });

    expect(directive(csp, "connect-src")).toBe(
      "connect-src 'self' https://abc.supabase.co wss://abc.supabase.co",
    );
    expect(csp.split("abc.supabase.co").length - 1).toBe(2);
    expect(
      directive(buildContentSecurityPolicy(production), "connect-src"),
    ).toBe("connect-src 'self'");
  });
});

describe("sessionCookieOptions (SEC-A04, SEC-C03)", () => {
  it("forces httpOnly and SameSite=Lax whatever the library asks for", () => {
    expect(
      sessionCookieOptions(
        { httpOnly: false, sameSite: "none", maxAge: 100, path: "/x" },
        true,
      ),
    ).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 100,
      path: "/",
    });
    expect(sessionCookieOptions({}, false).secure).toBe(false);
  });
});
