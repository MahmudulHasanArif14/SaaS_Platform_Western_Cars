import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import {
  latestEmailLink,
  mailboxAvailable,
  resetUser,
  SKIP_REASON,
  supabaseAvailable,
} from "./supabase";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    })),
  ).toEqual([]);
}

// Next.js adds its own live regions, so match ours by where they are.
const formAlert = (page: Page) => page.locator('form [role="alert"]');
const notice = (page: Page) => page.locator('main [role="status"]');

async function signIn(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

// TR-021 / SEC-C03: nothing auth-related in web storage, and the session
// cookies are not readable from JavaScript.
async function expectNoTokensInBrowser(page: Page) {
  const storage = await page.evaluate(() => ({
    local: Object.entries(window.localStorage),
    session: Object.entries(window.sessionStorage),
    cookies: document.cookie,
  }));
  const suspicious = /sb-|supabase|token|eyJ[A-Za-z0-9_-]{10,}/i;

  for (const [key, value] of [...storage.local, ...storage.session]) {
    expect(`${key}=${value}`).not.toMatch(suspicious);
  }
  expect(storage.cookies).not.toMatch(suspicious);
}

test.describe("signed out", () => {
  for (const theme of ["dark", "light"] as const) {
    for (const { path, heading } of [
      { path: "/login", heading: "Sign in" },
      { path: "/forgot-password", heading: "Reset your password" },
    ]) {
      test(`${path} renders and passes axe (${theme})`, async ({
        page,
      }, testInfo) => {
        await page.addInitScript((value) => {
          window.localStorage.setItem("theme", value);
        }, theme);
        await page.goto(path);

        await expect(
          page.getByRole("heading", { level: 1, name: heading }),
        ).toBeVisible();
        await expectNoAxeViolations(page);
        await page.screenshot({
          path: testInfo.outputPath(`${path.slice(1)}-${theme}.png`),
          fullPage: true,
        });
      });
    }
  }

  for (const path of [
    "/account",
    "/reset-password",
    "/Account",
    "/account/x",
  ]) {
    test(`${path} redirects to sign-in before rendering`, async ({
      request,
    }) => {
      const response = await request.get(path, { maxRedirects: 0 });

      expect(response.status()).toBe(307);
      const location = new URL(response.headers()["location"]!, "http://x");
      expect(location.pathname).toBe("/login");
      expect(location.searchParams.get("next")).toBe(path);
      expect(await response.text()).not.toContain("signed in");
    });
  }

  test("a prefetch header does not skip the redirect", async ({ request }) => {
    const response = await request.get("/account", {
      maxRedirects: 0,
      headers: { "next-router-prefetch": "1", rsc: "1" },
    });
    expect(response.status()).toBe(307);
  });

  test("a confirm link without a valid token is rejected", async ({ page }) => {
    await page.goto("/auth/confirm?token_hash=not-a-token&type=recovery");

    await expect(page).toHaveURL(/\/forgot-password\?error=link$/);
    await expect(formAlert(page)).toContainText("invalid or has expired");
  });

  test("a confirm link of an unsupported type is rejected", async ({
    request,
  }) => {
    const response = await request.get(
      "/auth/confirm?token_hash=abc&type=magiclink",
      { maxRedirects: 0 },
    );
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toContain(
      "/forgot-password?error=link",
    );
  });

  test("sign-in validates input before calling the server", async ({
    page,
  }) => {
    test.skip(!supabaseAvailable, "form is disabled when not configured");
    await page.goto("/login");
    await signIn(page, "not-an-email", "x");

    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.getByLabel("Email")).toHaveValue("not-an-email");
    await expectNoAxeViolations(page);
  });

  test("says so when sign-in is not configured", async ({ page }) => {
    test.skip(supabaseAvailable, "only applies without Supabase variables");
    await page.goto("/login");

    await expect(notice(page)).toContainText(
      "isn't set up in this environment",
    );
    await expect(page.getByRole("button", { name: "Sign in" })).toBeDisabled();
  });
});

test.describe("with Supabase Auth", () => {
  test.skip(!supabaseAvailable, SKIP_REASON);
  // One account per test file run; tests sign in independently.
  test.describe.configure({ mode: "serial" });

  const email = "e2e-user@example.test";
  const password = "correct-horse-battery-1";

  test.beforeAll(async () => {
    await resetUser(email, password);
  });

  test("signs in, keeps no tokens in the browser, and signs out", async ({
    page,
    context,
  }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?next=%2Faccount$/);
    await signIn(page, email, password);

    await expect(page).toHaveURL(/\/account$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "You're signed in" }),
    ).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expectNoAxeViolations(page);

    await expectNoTokensInBrowser(page);
    const sessionCookies = (await context.cookies()).filter((cookie) =>
      cookie.name.startsWith("sb-"),
    );
    expect(sessionCookies.length).toBeGreaterThan(0);
    for (const cookie of sessionCookies) {
      expect(cookie.httpOnly, cookie.name).toBe(true);
      expect(cookie.sameSite, cookie.name).toBe("Lax");
    }

    // A signed-in user is sent away from the sign-in page.
    await page.goto("/login");
    await expect(page).toHaveURL(/\/account$/);

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(
      (await context.cookies()).filter(
        (cookie) => cookie.name.startsWith("sb-") && cookie.value !== "",
      ),
    ).toEqual([]);

    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?next=%2Faccount$/);
  });

  test("gives the same answer for a wrong password and an unknown account", async ({
    page,
  }) => {
    const messages: string[] = [];
    for (const [address, secret] of [
      [email, "wrong-password-000"],
      ["nobody@example.test", "wrong-password-000"],
    ] as const) {
      await page.goto("/login");
      await signIn(page, address, secret);
      const alert = formAlert(page);
      await expect(alert).toBeVisible();
      messages.push((await alert.textContent()) ?? "");
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByLabel("Password")).toHaveValue("");
    }

    expect(messages[0]).toBe("The email or password is incorrect.");
    expect(messages[1]).toBe(messages[0]);
  });

  for (const next of [
    "//evil.example",
    "https://evil.example/",
    "/\\evil.example",
  ]) {
    test(`ignores an off-site next parameter: ${next}`, async ({
      page,
      baseURL,
    }) => {
      await page.goto(`/login?next=${encodeURIComponent(next)}`);
      await signIn(page, email, password);

      await expect(page).toHaveURL(`${baseURL}/account`);
    });
  }

  test("resets a password from the emailed link", async ({ page, context }) => {
    test.skip(!mailboxAvailable, "needs the local mailbox (E2E_MAILBOX_URL)");
    const resetEmail = "e2e-reset@example.test";
    const newPassword = "new-correct-horse-2";
    await resetUser(resetEmail, password);

    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(resetEmail);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(notice(page)).toContainText("reset link is on its way");

    const link = await latestEmailLink(resetEmail);
    expect(link).toContain("/auth/confirm?token_hash=");
    await page.goto(link);
    await expect(page).toHaveURL(/\/reset-password$/);
    await expectNoAxeViolations(page);

    await page.getByLabel("New password", { exact: true }).fill("short");
    await page.getByLabel("Confirm new password").fill("short");
    await page.getByRole("button", { name: "Save password" }).click();
    await expect(page.getByText("Use at least 12 characters.")).toBeVisible();

    await page.getByLabel("New password", { exact: true }).fill(newPassword);
    await page.getByLabel("Confirm new password").fill(newPassword);
    await page.getByRole("button", { name: "Save password" }).click();
    await expect(page).toHaveURL(/\/account\?password=updated$/);
    await expect(notice(page)).toContainText("Your password has been changed.");
    await expectNoTokensInBrowser(page);

    // The link is single-use.
    await context.clearCookies();
    await page.goto(link);
    await expect(page).toHaveURL(/\/forgot-password\?error=link$/);

    // The old password no longer works; the new one does.
    await page.goto("/login");
    await signIn(page, resetEmail, password);
    await expect(formAlert(page)).toBeVisible();
    await signIn(page, resetEmail, newPassword);
    await expect(page).toHaveURL(/\/account$/);
  });
});
