import { describe, expect, it } from "vitest";

import {
  EnvValidationError,
  parseClientEnv,
  parseServerEnv,
  validateEnv,
} from "@/lib/env/schema";

const deployed = {
  APP_ENV: "production",
  NEXT_PUBLIC_APP_URL: "https://app.example.test",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.example.test",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_value",
  SUPABASE_SECRET_KEY: "sb_secret_test_value",
};

function problemsOf(source: Record<string, string | undefined>): string[] {
  try {
    validateEnv(source);
  } catch (error) {
    if (error instanceof EnvValidationError) return [...error.problems];
    throw error;
  }
  return [];
}

describe("validateEnv", () => {
  it("accepts an empty environment locally", () => {
    expect(problemsOf({})).toEqual([]);
  });

  it("treats empty strings as unset", () => {
    expect(problemsOf({ APP_ENV: "", NEXT_PUBLIC_APP_URL: "" })).toEqual([]);
  });

  it("accepts a complete production environment", () => {
    expect(problemsOf(deployed)).toEqual([]);
  });

  it.each(["staging", "production"])(
    "rejects a missing server secret in %s",
    (appEnv) => {
      const problems = problemsOf({
        ...deployed,
        APP_ENV: appEnv,
        SUPABASE_SECRET_KEY: undefined,
      });

      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain("SUPABASE_SECRET_KEY");
    },
  );

  it("reports every missing variable at once", () => {
    const problems = problemsOf({ APP_ENV: "production" }).join("\n");

    expect(problems).toContain("NEXT_PUBLIC_APP_URL");
    expect(problems).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(problems).toContain("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    expect(problems).toContain("SUPABASE_SECRET_KEY");
  });

  it("requires https for the app URL when deployed", () => {
    const problems = problemsOf({
      ...deployed,
      NEXT_PUBLIC_APP_URL: "http://app.example.test",
    });

    expect(problems).toEqual([
      "NEXT_PUBLIC_APP_URL: must use https when APP_ENV is staging or production",
    ]);
  });

  it("rejects an unknown APP_ENV", () => {
    expect(problemsOf({ APP_ENV: "prod" }).join("\n")).toContain("APP_ENV");
  });

  it("rejects a malformed URL in any environment", () => {
    expect(
      problemsOf({ NEXT_PUBLIC_SUPABASE_URL: "not a url" }).join("\n"),
    ).toContain("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("rejects a secret key in the public Supabase key variable", () => {
    expect(
      problemsOf({
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_test_value",
      }).join("\n"),
    ).toContain("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  });

  it("rejects a production Vercel deployment without APP_ENV=production", () => {
    expect(problemsOf({ VERCEL_ENV: "production" })).toEqual([
      "APP_ENV: must be production when VERCEL_ENV is production",
    ]);
    expect(
      problemsOf({ ...deployed, APP_ENV: "staging", VERCEL_ENV: "production" }),
    ).toHaveLength(1);
    expect(problemsOf({ ...deployed, VERCEL_ENV: "production" })).toEqual([]);
  });

  it("never includes values in the error message", () => {
    const secret = "sb_secret_do_not_print_me";
    let message = "";
    try {
      validateEnv({
        APP_ENV: "production",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: secret,
        SUPABASE_SECRET_KEY: secret,
        NEXT_PUBLIC_APP_URL: "http://insecure.example.test",
      });
    } catch (error) {
      message = String(error);
    }

    expect(message).toContain("Invalid environment configuration");
    expect(message).not.toContain(secret);
    expect(message).not.toContain("insecure.example.test");
  });
});

describe("parsers", () => {
  it("defaults APP_ENV to local", () => {
    expect(parseServerEnv({}).APP_ENV).toBe("local");
  });

  it("returns only declared server variables", () => {
    const env = parseServerEnv({ ...deployed, UNRELATED_SECRET: "x" });

    expect(env.SUPABASE_SECRET_KEY).toBe("sb_secret_test_value");
    expect(env).not.toHaveProperty("UNRELATED_SECRET");
  });

  it("returns only public variables for the client", () => {
    const env = parseClientEnv(deployed);

    expect(Object.keys(env).sort()).toEqual([
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_URL",
    ]);
    expect(env).not.toHaveProperty("SUPABASE_SECRET_KEY");
  });

  it("throws EnvValidationError on invalid client input", () => {
    expect(() => parseClientEnv({ NEXT_PUBLIC_APP_URL: "nope" })).toThrow(
      EnvValidationError,
    );
  });
});
