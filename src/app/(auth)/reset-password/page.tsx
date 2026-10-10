import type { Metadata } from "next";

import { requireAuth } from "@/lib/authorization";
import { RESET_PASSWORD_PATH } from "@/lib/routes";
import { PASSWORD_MIN_LENGTH } from "@/modules/auth/auth.schema";

import { AuthCard } from "../auth-card";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

// Reached from the emailed link (via /auth/confirm), which signs the user in.
export default async function ResetPasswordPage() {
  const user = await requireAuth(RESET_PASSWORD_PATH);

  return (
    <AuthCard
      title="Choose a new password"
      description="Saving signs you out on your other devices."
    >
      <ResetPasswordForm email={user.email} minLength={PASSWORD_MIN_LENGTH} />
    </AuthCard>
  );
}
