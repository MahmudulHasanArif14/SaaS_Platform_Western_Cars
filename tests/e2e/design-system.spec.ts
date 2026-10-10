import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";

const PAGES = [
  { name: "tokens", path: "/design-system", heading: "Tokens" },
  {
    name: "components",
    path: "/design-system/components",
    heading: "Status and actions",
  },
  {
    name: "data-table",
    path: "/design-system/data-table",
    heading: "Data table",
  },
  { name: "states", path: "/design-system/states", heading: "Page states" },
];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function useTheme(page: Page, theme: "light" | "dark") {
  await page.addInitScript((value) => {
    window.localStorage.setItem("theme", value);
  }, theme);
}

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    })),
  ).toEqual([]);
}

for (const theme of ["dark", "light"] as const) {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`${theme} · ${viewportName}`, () => {
      test.use({ viewport });

      for (const { name, path, heading } of PAGES) {
        test(`${name} renders and passes axe`, async ({ page }, testInfo) => {
          await useTheme(page, theme);
          await page.goto(path);

          await expect(
            page.getByRole("heading", { level: 1, name: heading }),
          ).toBeVisible();
          await expect(page.locator("html")).toHaveClass(
            new RegExp(`\\b${theme}\\b`),
          );
          await expectNoViolations(page);

          await page.screenshot({
            path: testInfo.outputPath(`${name}-${theme}-${viewportName}.png`),
            fullPage: true,
          });
        });
      }
    });
  }
}

test.describe("app shell", () => {
  test("marks the current page and navigates from the sidebar", async ({
    page,
  }) => {
    await page.goto("/design-system");
    const nav = page.getByRole("navigation", { name: "Main" });

    await expect(nav.getByRole("link", { name: "Tokens" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await nav.getByRole("link", { name: "Data table" }).click();
    await expect(page).toHaveURL(/\/design-system\/data-table$/);
    await expect(nav.getByRole("link", { name: "Data table" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(nav.getByRole("link", { name: "Tokens" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("collapses the sidebar to an icon rail", async ({ page }) => {
    await page.goto("/design-system");
    const sidebar = page.locator('[data-slot="sidebar"]');

    await expect(sidebar).toHaveAttribute("data-state", "expanded");
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
    await expect(
      page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: "Tokens" }),
    ).toBeVisible();
    await expectNoViolations(page);
  });

  test("opens the command menu with the keyboard and navigates", async ({
    page,
  }) => {
    await page.goto("/design-system");
    const dialog = page.getByRole("dialog", { name: "Command menu" });

    // Retried because the shortcut is only bound once the page has hydrated.
    await expect(async () => {
      if (!(await dialog.isVisible())) await page.keyboard.press("Control+k");
      await expect(dialog).toBeVisible({ timeout: 1000 });
    }).toPass();
    await expectNoViolations(page);

    await page.keyboard.type("page states");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/design-system\/states$/);
    await expect(dialog).toBeHidden();
  });

  test("switches theme from the top bar", async ({ page }) => {
    await useTheme(page, "dark");
    await page.goto("/design-system");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.getByRole("button", { name: "Change theme" }).click();
    await page.getByRole("menuitemradio", { name: "Light" }).click();
    await expect(page.locator("html")).toHaveClass(/\blight\b/);
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  });

  test.describe("mobile", () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test("opens navigation as a sheet and closes it after navigating", async ({
      page,
    }, testInfo) => {
      await page.goto("/design-system");
      await page.getByRole("button", { name: "Toggle navigation" }).click();

      const sheet = page.getByRole("dialog");
      await expect(
        sheet.getByRole("link", { name: "Page states" }),
      ).toBeVisible();
      await expectNoViolations(page);
      await page.screenshot({
        path: testInfo.outputPath("navigation-sheet-mobile.png"),
      });

      await sheet.getByRole("link", { name: "Page states" }).click();
      await expect(page).toHaveURL(/\/design-system\/states$/);
      await expect(sheet).toBeHidden();
    });

    test("has no horizontal page scroll", async ({ page }) => {
      for (const { path } of PAGES) {
        await page.goto(path);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow, path).toBeLessThanOrEqual(0);
      }
    });

    test("shows table rows as cards", async ({ page }) => {
      await page.goto("/design-system/data-table");

      await expect(page.getByRole("table")).toBeHidden();
      const list = page.getByRole("list", { name: "Sample records" });
      await expect(list.getByRole("listitem")).toHaveCount(8);
      await expect(list.getByText("site-01.example.com")).toBeVisible();
    });
  });
});

test.describe("data table", () => {
  test("sorts and pages through controlled state", async ({ page }) => {
    await page.goto("/design-system/data-table");
    const table = page.getByRole("table", { name: "Sample records" });
    const firstCell = table.locator("tbody tr").first().locator("td").first();
    const nameHeader = table.getByRole("columnheader", { name: "Name" });

    await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    await expect(firstCell).toHaveText("site-01.example.com");
    await expect(page.getByText("1–8 of 23")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();

    await nameHeader.getByRole("button").click();
    await expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    await expect(firstCell).toHaveText("site-23.example.com");

    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("9–16 of 23")).toBeVisible();
    await expect(firstCell).toHaveText("site-15.example.com");
  });

  test("shows loading, empty and error states", async ({ page }) => {
    await page.goto("/design-system/data-table");
    const states = page.getByRole("group", { name: "Table state" });

    await states.getByRole("button", { name: "loading" }).click();
    await expect(page.getByText("Loading…")).toBeVisible();
    await expect(page.getByText("site-01.example.com")).toBeHidden();
    await expectNoViolations(page);

    await states.getByRole("button", { name: "empty" }).click();
    await expect(page.getByText("Nothing here yet").first()).toBeVisible();
    await expectNoViolations(page);

    await states.getByRole("button", { name: "error" }).click();
    const alert = page.getByRole("alert").first();
    await expect(alert).toContainText("Couldn't load sample records");
    await expect(alert).toContainText("demo-0000");
    await expectNoViolations(page);

    await alert.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByText("1–8 of 23")).toBeVisible();
  });
});

test.describe("feedback", () => {
  for (const theme of ["dark", "light"] as const) {
    test(`confirm dialog traps focus, confirms and toasts (${theme})`, async ({
      page,
    }) => {
      await useTheme(page, theme);
      await page.goto("/design-system/components");
      const trigger = page.getByRole("button", {
        name: "Delete sample record",
      });
      await trigger.click();

      const dialog = page.getByRole("alertdialog", {
        name: "Delete sample record www.example.com?",
      });
      await expect(dialog).toBeVisible();
      await expectNoViolations(page);

      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();

      await trigger.click();
      await dialog.getByRole("button", { name: "Delete record" }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText("Sample record deleted")).toBeVisible();
      await expectNoViolations(page);
    });
  }
});
