import { z } from "zod";

// TR-024. Supabase enforces the same minimum; bcrypt reads at most 72 bytes.
export const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 72;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address.").max(254));

export const signInSchema = z.strictObject({
  email,
  // No length rule on sign-in: it would reveal the policy to a guesser and
  // lock out accounts created under an older one.
  password: z.string().min(1, "Enter your password.").max(1024),
});

export const forgotPasswordSchema = z.strictObject({ email });

export const newPasswordSchema = z
  .strictObject({
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Use at least ${PASSWORD_MIN_LENGTH} characters.`,
      )
      .refine(
        (value) =>
          new TextEncoder().encode(value).length <= PASSWORD_MAX_LENGTH,
        `Use at most ${PASSWORD_MAX_LENGTH} characters.`,
      ),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords don't match.",
  });

// Email links handled by /auth/confirm. Only password recovery exists today.
export const emailTokenSchema = z.strictObject({
  tokenHash: z.string().min(1).max(512),
  type: z.enum(["recovery"]),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type EmailTokenInput = z.infer<typeof emailTokenSchema>;
