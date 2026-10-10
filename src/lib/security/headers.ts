// SEC-D06 / TRD §12. Pure builders, no environment access, so the same rules
// run in next.config.ts, src/proxy.ts and the unit tests.

export const NONCE_HEADER = "x-nonce";

// Sent on every response, static assets included (next.config.ts `headers`).
export const STATIC_SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=()",
  },
  // Legacy equivalent of `frame-ancestors 'none'`.
  { key: "X-Frame-Options", value: "DENY" },
] as const;

// sonner injects its stylesheet from JavaScript and has no nonce option. It
// appends an empty <style> and then fills it, so both hashes are needed.
// tests/unit/security-headers.test.ts fails if the installed sonner changes.
export const SONNER_STYLE_HASHES = [
  "sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=",
  "sha256-StEaX+se6YS7pqjzrzMIA0KaX9zF/8zAhvQXZAe5epY=",
] as const;

export function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

type CspOptions = {
  nonce: string;
  // `next dev` only: React needs eval for debugging and injects inline styles.
  isDevelopment: boolean;
  // Staging and production are always served over https.
  upgradeInsecureRequests: boolean;
};

export function buildContentSecurityPolicy({
  nonce,
  isDevelopment,
  upgradeInsecureRequests,
}: CspOptions): string {
  const styleHashes = SONNER_STYLE_HASHES.map((hash) => `'${hash}'`).join(" ");
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    ...(isDevelopment
      ? ["style-src 'self' 'unsafe-inline'"]
      : [
          // Fallback for browsers without style-src-elem / style-src-attr.
          `style-src 'self' 'nonce-${nonce}'`,
          `style-src-elem 'self' 'nonce-${nonce}' ${styleHashes}`,
          // React renders the `style` prop as an attribute on the server.
          // Stylesheets and <style> elements stay nonce-only.
          "style-src-attr 'unsafe-inline'",
        ]),
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (upgradeInsecureRequests) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}
