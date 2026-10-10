"use client";

import { ErrorState } from "@/components/state-view";
import { Button } from "@/components/ui/button";

// Shows a safe message and the error digest only; never the stack or message.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center">
      <ErrorState
        referenceId={error.digest}
        action={
          <Button variant="outline" onClick={() => retry()}>
            Try again
          </Button>
        }
      />
    </main>
  );
}
