import { readdirSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "./fixtures";

// SEC-D03, SEC-D06 against the production build.

const PAGES = ["/", "/design-system", "/this-route-does-not-exist"];

function nonceFrom(csp: string | undefined): string {
  const match = csp?.match(/'nonce-([^']+)'/);
  expect(match, "CSP carries a nonce").not.toBeNull();
  return match![1]!;
}

for (const path of PAGES) {
  test(`${path} sends the security headers`, async ({ request }) => {
    const response = await request.get(path);
    const headers = response.headers();

    expect(headers["strict-transport-security"]).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toBe(
      "camera=(self), microphone=(self), geolocation=()",
    );
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-powered-by"]).toBeUndefined();

    const csp = headers["content-security-policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).not.toContain("'unsafe-eval'");

    const scriptSrc = csp?.split("; ").find((d) => d.startsWith("script-src "));
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  test(`${path} puts the request nonce on every script`, async ({
    request,
  }) => {
    const response = await request.get(path);
    const nonce = nonceFrom(response.headers()["content-security-policy"]);
    const scripts = (await response.text()).match(/<script\b[^>]*>/g) ?? [];

    expect(scripts.length).toBeGreaterThan(0);
    for (const script of scripts) {
      expect(script).toContain(`nonce="${nonce}"`);
    }
  });
}

test("the nonce is different on every request", async ({ request }) => {
  const nonces = new Set<string>();
  for (let i = 0; i < 5; i++) {
    const response = await request.get("/");
    nonces.add(nonceFrom(response.headers()["content-security-policy"]));
  }
  expect(nonces.size).toBe(5);
});

test("static assets carry the headers and no X-Powered-By", async ({
  request,
}) => {
  const html = await (await request.get("/")).text();
  const asset = html.match(/\/_next\/static\/[^"']+\.js/)?.[0];
  expect(asset).toBeDefined();

  const response = await request.get(asset!);
  expect(response.status()).toBe(200);
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});

test("browser source maps are not built or served", async ({ request }) => {
  const files = readdirSync(join(".next", "static"), { recursive: true }).map(
    String,
  );
  expect(files.filter((file) => file.endsWith(".map"))).toEqual([]);

  const html = await (await request.get("/")).text();
  const asset = html.match(/\/_next\/static\/[^"']+\.js/)?.[0];
  expect((await request.get(`${asset}.map`)).status()).toBe(404);
});

test.describe("injected markup", () => {
  // These tests cause violations on purpose.
  test.use({ expectCspViolations: true });

  test("an inline event handler is blocked", async ({
    page,
    cspViolations,
  }) => {
    await page.goto("/");
    await page.evaluate(() => {
      document.body.insertAdjacentHTML(
        "beforeend",
        '<img src="/missing.png" onerror="window.__injected = true">',
      );
    });

    await expect.poll(() => cspViolations.length).toBeGreaterThan(0);
    expect(cspViolations.join("\n")).toContain("script-src");
    expect(await page.evaluate(() => "__injected" in window)).toBe(false);
  });

  test("an injected <style> element is blocked", async ({
    page,
    cspViolations,
  }) => {
    await page.goto("/");
    const applied = await page.evaluate(() => {
      const style = document.createElement("style");
      style.textContent = "body { outline: 7px solid red }";
      document.head.appendChild(style);
      return getComputedStyle(document.body).outlineWidth;
    });

    expect(applied).not.toBe("7px");
    expect(cspViolations.join("\n")).toContain("style-src-elem");
  });
});
