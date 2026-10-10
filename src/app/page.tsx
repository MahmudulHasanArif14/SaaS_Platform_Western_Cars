import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/app";
import { serverEnv } from "@/lib/env/server";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
        <span className="font-semibold">{APP_NAME}</span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Sign-in is not available yet</h1>
        <p className="max-w-md text-muted-foreground">
          This build contains the application foundation only. Accounts,
          organisations and the operations modules have not been built.
        </p>
        {serverEnv.APP_ENV === "production" ? null : (
          <Button asChild variant="outline">
            <Link href="/design-system">View the design system</Link>
          </Button>
        )}
      </main>
    </div>
  );
}
