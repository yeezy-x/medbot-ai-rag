"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

interface EditPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: string;
  onSubmit: (next: string) => void;
}

export function EditPromptDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
}: EditPromptDialogProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-lg rounded-t-2xl border border-border-subtle bg-surface-3 p-6"
        data-testid="edit-prompt-dialog"
      >
        <form onSubmit={handleSubmit}>
          <SheetHeader className="mb-4 items-start p-0 text-left">
            <SheetTitle className="text-[1rem] font-semibold">
              Edit question
            </SheetTitle>
            <SheetDescription className="text-[0.8rem] text-muted-foreground">
              Your edit removes the previous answer and sends a new request.
            </SheetDescription>
          </SheetHeader>
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            className="min-h-28 resize-y"
            data-testid="edit-prompt-textarea"
            autoFocus
          />
          <SheetFooter className="mt-4 flex flex-row justify-end gap-2 p-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" data-testid="edit-prompt-submit">
              Save & resend
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
