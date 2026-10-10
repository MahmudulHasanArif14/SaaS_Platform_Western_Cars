import { CompassIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/state-view";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={CompassIcon}
        title="Page not found"
        description="The page doesn't exist or you don't have access to it."
        action={
          <Button asChild variant="outline">
            <Link href="/">Go to the start page</Link>
          </Button>
        }
      />
    </main>
  );
}
