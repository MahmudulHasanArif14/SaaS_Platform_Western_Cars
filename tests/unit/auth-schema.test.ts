import { describe, expect, it } from "vitest";

import {
  emailTokenSchema,
  forgotPasswordSchema,
  newPasswordSchema,
  signInSchema,
} from "@/modules/auth/auth.schema";

describe("signInSchema", () => {
  it("normalises the email and keeps the password untouched", () => {
    expect(
      signInSchema.parse({ email: "  User@Example.TEST ", password: " p w " }),
    ).toEqual({ email: "user@example.test", password: " p w " });
  });

  it.each(["", "not-an-email", "a@b", `${"a".repeat(250)}@example.test`])(
    "rejects the email %j",
    (email) => {
      expect(signInSchema.safeParse({ email, password: "x" }).success).toBe(
        false,
      );
    },
  );

  it("rejects an empty password and unknown fields", () => {
    const base = { email: "user@example.test", password: "x" };

    expect(signInSchema.safeParse({ ...base, password: "" }).success).toBe(
      false,
    );
    expect(signInSchema.safeParse({ ...base, role: "admin" }).success).toBe(
      false,
    );
    expect(
      signInSchema.safeParse({ ...base, organization_id: "1" }).success,
    ).toBe(false);
  });

  it("does not apply the password policy on sign-in", () => {
    expect(
      signInSchema.safeParse({ email: "user@example.test", password: "short" })
        .success,
    ).toBe(true);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts only an email", () => {
    expect(forgotPasswordSchema.parse({ email: "A@Example.test" })).toEqual({
      email: "a@example.test",
    });
    expect(forgotPasswordSchema.safeParse({ email: "x" }).success).toBe(false);
  });
});

describe("newPasswordSchema (TR-024)", () => {
  const both = (password: string) => ({ password, confirmPassword: password });

  it("requires at least 12 characters", () => {
    expect(newPasswordSchema.safeParse(both("a".repeat(11))).success).toBe(
      false,
    );
    expect(newPasswordSchema.safeParse(both("a".repeat(12))).success).toBe(
      true,
    );
  });

  it("limits the password to 72 bytes, not characters", () => {
    expect(newPasswordSchema.safeParse(both("a".repeat(72))).success).toBe(
      true,
    );
    expect(newPasswordSchema.safeParse(both("a".repeat(73))).success).toBe(
      false,
    );
    // 25 characters, 75 bytes.
    expect(newPasswordSchema.safeParse(both("€".repeat(25))).success).toBe(
      false,
    );
  });

  it("requires the confirmation to match", () => {
    const result = newPasswordSchema.safeParse({
      password: "correct-horse-battery",
      confirmPassword: "correct-horse-batterx",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });
});

describe("emailTokenSchema", () => {
  it("accepts a recovery token", () => {
    expect(
      emailTokenSchema.safeParse({ tokenHash: "abc", type: "recovery" })
        .success,
    ).toBe(true);
  });

  it.each([
    { tokenHash: null, type: "recovery" },
    { tokenHash: "", type: "recovery" },
    { tokenHash: "a".repeat(513), type: "recovery" },
    { tokenHash: "abc", type: "magiclink" },
    { tokenHash: "abc", type: "signup" },
    { tokenHash: "abc", type: null },
  ])("rejects %j", (input) => {
    expect(emailTokenSchema.safeParse(input).success).toBe(false);
  });
});
