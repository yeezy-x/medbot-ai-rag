import { requireApiUser } from "@/lib/auth-utils";
import { requestHandler } from "@/lib/request-handler";

import { ChatService } from "@/modules/chat/services";

const chatService = new ChatService();

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const { id } = await context.params;
    return chatService.getChatById(id, user.id);
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const { id } = await context.params;
    const body = (await request.json()) as { title?: unknown };
    if (typeof body?.title !== "string") {
      throw new Error("title (string) is required");
    }
    return chatService.renameChat(id, user.id, body.title);
  });
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const { id } = await context.params;
    return chatService.deleteChat(id, user.id);
  });
}
