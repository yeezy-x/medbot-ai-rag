import { Message } from "../types/chat.types";
import { MessageItem }
from "./message-item";

export function MessageList({
  messages,
}: {
  messages: Message[];
}) {
  return (
    <div className="space-y-4">
      {messages.map(
        message => (
          <MessageItem
            key={message.id}
            role={message.role}
            content={
              message.content
            }
          />
        )
      )}
    </div>
  );
}