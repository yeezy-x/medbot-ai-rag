import {
  ChatService,
} from "@/modules/chat/services";

import { auth }
from "@/auth";
import { Button } from "@/components/ui/button";

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

      <Button>
        New Chat
      </Button>

      {chats.map(chat => (
        <div key={chat.id}>
          {chat.title}
        </div>
      ))}

    </aside>
  );
}