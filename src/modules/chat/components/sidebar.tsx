import {
  ChatService,
} from "@/modules/chat/services";

import { auth }
from "@/auth";

export async function Sidebar() {

  const session =
    await auth();

  const chatService =
    new ChatService();

  const chats =
    await chatService.getUserChats(
      session!.user.id
    );

  return (
    <aside>

      <button>
        New Chat
      </button>

      {chats.map(chat => (
        <div key={chat.id}>
          {chat.title}
        </div>
      ))}

    </aside>
  );
}