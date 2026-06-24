// src/modules/chat/components/chat-list.tsx
import { ChatItem } from "./chat-item";

interface Chat {
  id: string;
  title: string;
}

interface ChatListProps {
  chats: Chat[];
}

export function ChatList({ chats }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <p className="px-3 py-2 text-sm text-muted-foreground">
        No conversations yet.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <ChatItem key={chat.id} id={chat.id} title={chat.title} />
      ))}
    </div>
  );
}