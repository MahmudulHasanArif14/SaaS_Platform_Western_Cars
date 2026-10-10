// SEC-C02: fail if the browser bundle contains a secret, a secret-shaped
// value or the name of a server-only variable. Run after `next build`.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const STATIC_DIR = join(".next", "static");

const FORBIDDEN = [
  /sb_secret_/,
  /sk_live_/,
  /sk_test_/,
  /rk_live_/,
  /whsec_/,
  /SUPABASE_SECRET_KEY/,
  /ENCRYPTION_KEY/,
  /STRIPE_SECRET_KEY/,
  /STRIPE_WEBHOOK_SECRET/,
  /DOJO_API_KEY/,
  /DOJO_WEBHOOK_SECRET/,
  /CLOUDFLARE_API_TOKEN/,
  /EMAIL_API_KEY/,
  /TURN_SECRET/,
];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

let scanned;
try {
  scanned = files(STATIC_DIR);
} catch {
  console.error(`${STATIC_DIR} not found. Run \`npm run build\` first.`);
  process.exit(1);
}

const hits = [];
for (const file of scanned) {
  const content = readFileSync(file, "latin1");
  for (const pattern of FORBIDDEN) {
    // Report the file and pattern only, never the matched text.
    if (pattern.test(content)) hits.push(`${file}: matches ${pattern}`);
  }
}

if (hits.length > 0) {
  console.error(
    `Client bundle contains forbidden strings:\n${hits.join("\n")}`,
  );
  process.exit(1);
}

console.log(`Client bundle clean (${scanned.length} files scanned).`);
