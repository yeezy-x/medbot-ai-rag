"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createChat } from "@/modules/chat/api/chat.api";

/** Global chat shortcuts: ⌘⏎ new chat, ⌘/ focus composer. (⌘K is owned by useCommandPalette.) */
export function useChatShortcuts() {
  const router = useRouter();

  useEffect(() => {
    async function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "k") return;

      const target = e.target;
      const inField =
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLInputElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (inField) return;

      if (e.key === "Enter") {
        e.preventDefault();
        try {
          const result = await createChat("New conversation");
          router.push(`/chat/${result.data.id}`);
          router.refresh();
        } catch {
          toast.error("Couldn't start a new conversation");
        }
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("medbot:focus-composer"));
        return;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
}
