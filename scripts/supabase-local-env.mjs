// Prints the environment variables for the local Supabase stack
// (`npx supabase start`) in KEY=value form. Local credentials only.
//
//   CI:    node scripts/supabase-local-env.mjs >> "$GITHUB_ENV"
//   Local: node scripts/supabase-local-env.mjs > .env.local
import { execFileSync } from "node:child_process";

let status;
try {
  status = JSON.parse(
    execFileSync("npx", ["supabase", "status", "-o", "json"], {
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "inherit"],
    }),
  );
} catch {
  console.error(
    "Could not read the local Supabase status. Run `npx supabase start` first.",
  );
  process.exit(1);
}

// The CLI has used both the legacy and the current key names.
const pick = (...names) => names.map((name) => status[name]).find(Boolean);

const values = {
  NEXT_PUBLIC_SUPABASE_URL: pick("API_URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: pick("PUBLISHABLE_KEY", "ANON_KEY"),
  SUPABASE_SECRET_KEY: pick("SECRET_KEY", "SERVICE_ROLE_KEY"),
  // Test-only: where the E2E suite reads emails sent by the local stack.
  E2E_MAILBOX_URL: pick("MAILPIT_URL", "INBUCKET_URL"),
};

const missing = Object.entries(values)
  .filter(([name, value]) => !value && name !== "E2E_MAILBOX_URL")
  .map(([name]) => name);
if (missing.length > 0) {
  // Names only: never print the status payload, it contains keys.
  console.error(
    `Local Supabase status is missing: ${missing.join(", ")} (available: ${Object.keys(status).join(", ")}).`,
  );
  process.exit(1);
}

for (const [name, value] of Object.entries(values)) {
  if (value) console.log(`${name}=${value}`);
}
