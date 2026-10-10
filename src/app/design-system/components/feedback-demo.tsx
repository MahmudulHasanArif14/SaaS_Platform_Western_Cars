"use client";

import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";

export function FeedbackDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ConfirmDialog
        trigger={<Button variant="destructive">Delete sample record</Button>}
        title="Delete sample record www.example.com?"
        description="This is a demonstration. Nothing is deleted."
        impact={[
          "The record stops resolving for visitors.",
          "You can add it again afterwards.",
        ]}
        confirmLabel="Delete record"
        destructive
        onConfirm={() => {
          toast.success("Sample record deleted", {
            description: "Demonstration only. No data changed.",
          });
        }}
      />
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Changes saved", {
            description: "Demonstration only.",
          })
        }
      >
        Show success toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Couldn't save changes", {
            description: "Try again. Reference: demo-0000",
          })
        }
      >
        Show error toast
      </Button>
    </div>
  );
}
