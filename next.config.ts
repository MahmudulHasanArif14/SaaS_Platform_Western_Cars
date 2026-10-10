import type { NextConfig } from "next";
import { validateEnv } from "./src/lib/env/schema";
import { STATIC_SECURITY_HEADERS } from "./src/lib/security/headers";

// Fails `next build`, `next start` and `next dev` on invalid configuration.
validateEnv(process.env);

const nextConfig: NextConfig = {
  // SEC-D03, SEC-D06. The nonce-based CSP is set per request in src/proxy.ts.
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [{ source: "/:path*", headers: [...STATIC_SECURITY_HEADERS] }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
