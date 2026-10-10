import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { APP_NAME } from "@/lib/app";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
        <Link href="/" className="font-semibold">
          {APP_NAME}
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
