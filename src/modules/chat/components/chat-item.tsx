// src/modules/chat/components/chat-item.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChatItemProps {
  id: string;
  title: string;
}

export function ChatItem({ id, title }: ChatItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/chat/${id}`;

  return (
    <Link
      href={`/chat/${id}`}
      className={cn(
        "block truncate rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
        isActive && "bg-muted font-medium"
      )}
      title={title}
    >
      {title}
    </Link>
  );
}