import { CircleCheckIcon } from "lucide-react";
import type { Metadata } from "next";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/app";
import { requireAuth } from "@/lib/authorization";
import { SIGNED_IN_HOME_PATH } from "@/lib/routes";

import { signOutAction } from "../(auth)/actions";

export const metadata: Metadata = { title: "Account" };

// Where a signed-in user lands until organisations exist (T-107).
export default async function AccountPage({
  searchParams,
}: PageProps<"/account">) {
  const user = await requireAuth(SIGNED_IN_HOME_PATH);
  const { password } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
        <span className="font-semibold">{APP_NAME}</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        {password === "updated" ? (
          <p
            role="status"
            className="flex items-center gap-2 rounded-lg border bg-surface-2 px-3 py-2 text-sm"
          >
            <CircleCheckIcon aria-hidden className="size-4 text-success" />
            Your password has been changed.
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold">You&apos;re signed in</h1>
        <p className="max-w-md text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">
            {user.email ?? "an account without an email address"}
          </span>
          . You don&apos;t belong to an organisation yet: organisations and the
          operations modules have not been built.
        </p>
      </main>
    </div>
  );
}
