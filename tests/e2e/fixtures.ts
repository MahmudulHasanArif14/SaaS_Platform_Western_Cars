import { expect, test as base } from "@playwright/test";

type Fixtures = {
  // Set with `test.use` in tests that trigger violations on purpose.
  expectCspViolations: boolean;
  cspViolations: string[];
};

// Every E2E test fails if the browser reports a Content-Security-Policy
// violation, so the policy is checked against every page and interaction.
export const test = base.extend<Fixtures>({
  expectCspViolations: [false, { option: true }],
  cspViolations: [
    async ({ page, expectCspViolations }, use) => {
      const violations: string[] = [];
      page.on("console", (message) => {
        if (/Content Security Policy/i.test(message.text())) {
          violations.push(message.text());
        }
      });
      await use(violations);
      if (!expectCspViolations) expect(violations).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
