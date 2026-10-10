import { ESLint } from "eslint";
import { beforeAll, describe, expect, it } from "vitest";

// Proves the ESLint guards for TR-001 and SEC-A03 are active, so a config
// change that silently drops them fails the test run.
// ESLint cold start (config, parser, plugins) can take several seconds.
describe("lint guards", { timeout: 30_000 }, () => {
  let eslint: ESLint;

  beforeAll(() => {
    eslint = new ESLint();
  });

  async function ruleIds(code: string, filePath: string) {
    const [result] = await eslint.lintText(code, { filePath });
    return (result?.messages ?? []).map((message) => message.ruleId);
  }

  it.each([
    ["@/lib/supabase/admin"],
    ["stripe"],
    ["@/modules/integrations/providers/stripe/client"],
    ["@supabase/supabase-js"],
  ])("blocks importing %s from UI code", async (specifier) => {
    const code = `import x from "${specifier}";\nexport const y = x;\n`;

    expect(await ruleIds(code, "src/app/example/page.tsx")).toContain(
      "no-restricted-imports",
    );
    expect(await ruleIds(code, "src/components/example.tsx")).toContain(
      "no-restricted-imports",
    );
  });

  it("allows the same imports in server-side module code", async () => {
    const code =
      'import Stripe from "stripe";\nimport { admin } from "@/lib/supabase/admin";\nexport const s = [Stripe, admin];\n';

    expect(
      await ruleIds(code, "src/modules/payments/payments.service.ts"),
    ).not.toContain("no-restricted-imports");
  });

  it("blocks raw process.env outside lib/env", async () => {
    const code = "export const url = process.env.NEXT_PUBLIC_APP_URL;\n";

    expect(
      await ruleIds(code, "src/modules/domains/domains.service.ts"),
    ).toContain("no-restricted-syntax");
    expect(await ruleIds(code, "src/lib/env/client.ts")).not.toContain(
      "no-restricted-syntax",
    );
  });

  it("blocks dangerouslySetInnerHTML", async () => {
    const code =
      'export default function X() {\n  return <div dangerouslySetInnerHTML={{ __html: "<b>x</b>" }} />;\n}\n';

    expect(await ruleIds(code, "src/components/example.tsx")).toContain(
      "react/no-danger",
    );
  });
});
