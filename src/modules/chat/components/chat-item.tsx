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
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition",
        isActive &&
          "bg-muted font-medium"
      )}
    >
      <span>💬</span>

      <span className="truncate">
        {title}
      </span>
    </Link>
  );
}