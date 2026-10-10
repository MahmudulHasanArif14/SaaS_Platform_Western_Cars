import type { Metadata } from "next";
import Link from "next/link";

import { FORGOT_PASSWORD_PATH } from "@/lib/routes";
import { getSupabaseConfig } from "@/lib/supabase/config";

import { AuthCard, NotConfiguredNotice } from "../auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const configured = getSupabaseConfig() !== null;

  return (
    <AuthCard
      title="Sign in"
      description="Accounts are created by an administrator."
      footer={
        <Link
          href={FORGOT_PASSWORD_PATH}
          className="text-primary underline-offset-4 hover:underline"
        >
          Forgot your password?
        </Link>
      }
    >
      {configured ? null : <NotConfiguredNotice />}
      <LoginForm
        next={typeof next === "string" ? next : undefined}
        disabled={!configured}
      />
    </AuthCard>
  );
}
