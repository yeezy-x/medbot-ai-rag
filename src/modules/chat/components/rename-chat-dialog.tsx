"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  onSubmit: (nextTitle: string) => void | Promise<void>;
}

/**
 * Minimal rename dialog. Uses `Sheet` for consistency with the retrieval
 * inspector, but positioned bottom-centered so it reads as a modal.
 */
export function RenameChatDialog({
  open,
  onOpenChange,
  initialTitle,
  onSubmit,
}: RenameChatDialogProps) {
  const [value, setValue] = useState(initialTitle);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => setValue(initialTitle));
    }
  }, [open, initialTitle]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || trimmed === initialTitle) {
      onOpenChange(false);
      return;
    }
    void onSubmit(trimmed);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-2xl border border-border-subtle bg-surface-3 p-6"
        data-testid="rename-chat-dialog"
      >
        <form onSubmit={handleSave}>
          <SheetHeader className="mb-4 items-start p-0 text-left">
            <SheetTitle className="text-[1rem] font-semibold">
              Rename conversation
            </SheetTitle>
            <SheetDescription className="text-[0.8rem] text-muted-foreground">
              Pick a short, descriptive title. Only you can see this.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-2">
            <Label htmlFor="chat-title" className="text-[0.8rem]">
              Title
            </Label>
            <Input
              id="chat-title"
              value={value}
              onChange={(e) => setValue(e.target.value.slice(0, 200))}
              autoFocus
              maxLength={200}
              data-testid="rename-chat-input"
            />
            <div className="text-right text-[0.65rem] text-muted-foreground">
              {value.length}/200
            </div>
          </div>
          <SheetFooter className="mt-4 flex flex-row justify-end gap-2 p-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!value.trim() || value.trim() === initialTitle}
              data-testid="rename-chat-submit"
            >
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
