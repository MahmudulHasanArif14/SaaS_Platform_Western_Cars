import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

// TR-001: UI code never imports the elevated Supabase client, a provider
// adapter or a provider SDK. It goes through a module service instead.
const uiRestrictedImports = {
  paths: [
    {
      name: "@supabase/supabase-js",
      message: "Use the clients in @/lib/supabase/{server,client}.",
    },
  ],
  patterns: [
    {
      group: ["@/lib/supabase/admin", "**/lib/supabase/admin"],
      message:
        "The admin (secret key) client is server-only and must not be imported from UI code.",
    },
    {
      group: [
        "@/modules/integrations/providers/**",
        "**/modules/integrations/providers/**",
      ],
      message:
        "Provider adapters are called from module services, not from UI code.",
    },
    {
      group: [
        "stripe",
        "stripe/*",
        "cloudflare",
        "cloudflare/*",
        "@octokit/*",
        "octokit",
        "@vercel/sdk",
        "@vercel/sdk/*",
        "resend",
        "postmark",
        "twilio",
      ],
      message:
        "Provider SDKs live behind adapters in @/modules/integrations/providers.",
    },
  ],
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    rules: {
      // SEC-A03: no raw HTML injection.
      "react/no-danger": "error",
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", uiRestrictedImports],
    },
  },
  {
    // TR §14: configuration is read through @/lib/env/{server,client} only.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/env/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Read configuration from @/lib/env/server or @/lib/env/client, not process.env.",
        },
      ],
    },
  },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Tooling output and vendored agent files:
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "graphify-out/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
