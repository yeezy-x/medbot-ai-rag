// src/modules/dashboard/components/recent-chats.tsx

import Link from "next/link";
import { MessageSquareText } from "lucide-react";

import { relativeTime } from "@/lib/format";

interface Chat {
  id: string;
  title: string;
  updatedAt?: Date | string;
}

interface Props {
  chats: Chat[];
}

export function RecentChats({ chats }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          href={`/chat/${chat.id}`}
          className="group flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-3 p-4 transition-colors hover:border-brand/30 hover:bg-surface-3/80"
          data-testid={`dashboard-chat-${chat.id}`}
        >
          <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-brand" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-foreground">
              {chat.title || "Untitled"}
            </div>
            {chat.updatedAt ? (
              <div className="mt-1 text-[0.75rem] text-muted-foreground">
                {relativeTime(chat.updatedAt)}
              </div>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
