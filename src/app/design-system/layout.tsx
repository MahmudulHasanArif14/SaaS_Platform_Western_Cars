import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { serverEnv } from "@/lib/env/server";

import { DesignSystemShell } from "./shell";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false },
};

// Internal reference for the tokens, app shell and base components.
// Not served in production.
export default function DesignSystemLayout({
  children,
}: LayoutProps<"/design-system">) {
  if (serverEnv.APP_ENV === "production") notFound();

  return <DesignSystemShell>{children}</DesignSystemShell>;
}
