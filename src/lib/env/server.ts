import "server-only";

import { parseServerEnv } from "./schema";

// Server-only configuration and secrets. Never import this from client code.
export const serverEnv = parseServerEnv(process.env);
