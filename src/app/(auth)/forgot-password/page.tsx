import type { Metadata } from "next";
import Link from "next/link";

import { LOGIN_PATH } from "@/lib/routes";
import { getSupabaseConfig } from "@/lib/supabase/config";

import { AuthCard, NotConfiguredNotice } from "../auth-card";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps<"/forgot-password">) {
  const { error } = await searchParams;
  const configured = getSupabaseConfig() !== null;

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we'll send a link to choose a new password."
      footer={
        <Link
          href={LOGIN_PATH}
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      {configured ? null : <NotConfiguredNotice />}
      <ForgotPasswordForm
        disabled={!configured}
        initialMessage={
          error === "link"
            ? "That link is invalid or has expired. Request a new one."
            : undefined
        }
      />
    </AuthCard>
  );
}
