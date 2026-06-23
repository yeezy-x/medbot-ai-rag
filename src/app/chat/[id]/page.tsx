import {
  ChatService,
} from "@/modules/chat/services";

import { auth }
from "@/auth";

export default async function ChatDetailPage(
  {
    params,
  }: {
    params: {
      id: string;
    };
  }
) {

  const session =
    await auth();

  const service =
    new ChatService();

  const chat =
    await service.getChatById(
      params.id,
      session!.user.id
    );

  return (
    <div>
      <h1>
        {chat.title}
      </h1>
    </div>
  );
}