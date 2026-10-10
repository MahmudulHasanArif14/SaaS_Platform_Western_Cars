import { z } from "zod";

// Pure schemas and parsers. No `process.env` access and no side effects here,
// so the same rules run in next.config.ts (build/start), server.ts, client.ts
// and the unit tests.

export const APP_ENVS = ["local", "test", "staging", "production"] as const;
export type AppEnv = (typeof APP_ENVS)[number];

type EnvSource = Record<string, string | undefined>;

// `KEY=` in an .env file means "not set".
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(emptyToUndefined, schema.optional());

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: optional(z.url()),
  NEXT_PUBLIC_SUPABASE_URL: optional(z.url()),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optional(
    z.string().refine((value) => !value.startsWith("sb_secret_"), {
      message: "must be a publishable key, not a secret key",
    }),
  ),
});

const serverSchema = z.object({
  APP_ENV: optional(z.enum(APP_ENVS)),
  VERCEL_ENV: optional(z.string()),
  SUPABASE_SECRET_KEY: optional(z.string()),
});

const CLIENT_REQUIRED_WHEN_DEPLOYED = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;
const SERVER_REQUIRED_WHEN_DEPLOYED = ["SUPABASE_SECRET_KEY"] as const;

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = Omit<z.infer<typeof serverSchema>, "APP_ENV"> & {
  APP_ENV: AppEnv;
};

export class EnvValidationError extends Error {
  // Messages carry variable names and reasons only, never values.
  constructor(readonly problems: readonly string[]) {
    super(
      `Invalid environment configuration:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`,
    );
    this.name = "EnvValidationError";
  }
}

function schemaProblems(error: z.ZodError): string[] {
  return error.issues.map(
    (issue) => `${issue.path.join(".")}: ${issue.message}`,
  );
}

function missing(env: EnvSource, names: readonly string[]): string[] {
  return names
    .filter((name) => env[name] === undefined || env[name] === "")
    .map((name) => `${name}: required when APP_ENV is staging or production`);
}

const isDeployed = (appEnv: AppEnv) =>
  appEnv === "staging" || appEnv === "production";

export function parseClientEnv(source: EnvSource): ClientEnv {
  const result = clientSchema.safeParse(source);
  if (!result.success)
    throw new EnvValidationError(schemaProblems(result.error));
  return result.data;
}

export function parseServerEnv(source: EnvSource): ServerEnv {
  const result = serverSchema.safeParse(source);
  if (!result.success)
    throw new EnvValidationError(schemaProblems(result.error));
  return { ...result.data, APP_ENV: result.data.APP_ENV ?? "local" };
}

// Full check, run once at build and at server start from next.config.ts.
export function validateEnv(source: EnvSource): void {
  const problems: string[] = [];

  const client = clientSchema.safeParse(source);
  if (!client.success) problems.push(...schemaProblems(client.error));
  const server = serverSchema.safeParse(source);
  if (!server.success) problems.push(...schemaProblems(server.error));

  if (server.success) {
    const appEnv = server.data.APP_ENV ?? "local";

    // A production deployment must never fall back to the lenient local rules.
    if (server.data.VERCEL_ENV === "production" && appEnv !== "production") {
      problems.push(
        "APP_ENV: must be production when VERCEL_ENV is production",
      );
    }

    if (isDeployed(appEnv)) {
      problems.push(
        ...missing(source, CLIENT_REQUIRED_WHEN_DEPLOYED),
        ...missing(source, SERVER_REQUIRED_WHEN_DEPLOYED),
      );
      if (
        client.success &&
        client.data.NEXT_PUBLIC_APP_URL &&
        !client.data.NEXT_PUBLIC_APP_URL.startsWith("https://")
      ) {
        problems.push(
          "NEXT_PUBLIC_APP_URL: must use https when APP_ENV is staging or production",
        );
      }
    }
  }

  if (problems.length > 0) throw new EnvValidationError(problems);
}
