// src/modules/dashboard/components/recent-chats.tsx

import Link from "next/link";

interface Chat {
  id: string;
  title: string;
}

interface Props {
  chats: Chat[];
}

export function RecentChats({
  chats,
}: Props) {
  return (
    <div className="space-y-2">
      {chats.map(chat => (
        <Link
          key={chat.id}
          href={`/chat/${chat.id}`}
          className="
            block
            rounded-lg
            border
            p-4
            hover:bg-muted
          "
        >
          {chat.title}
        </Link>
      ))}
    </div>
  );
}