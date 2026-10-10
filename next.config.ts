import type { NextConfig } from "next";
import { validateEnv } from "./src/lib/env/schema";

// Fails `next build`, `next start` and `next dev` on invalid configuration.
validateEnv(process.env);

const nextConfig: NextConfig = {
  /* config options here */
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
