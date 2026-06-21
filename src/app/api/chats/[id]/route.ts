import { auth } from "@/auth";
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
    const session = await auth();

    const { id } =
      await context.params;

    return chatService.getChatById(
      id,
      session!.user.id
    );
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
    const session = await auth();

    const { id } =
      await context.params;

    return chatService.deleteChat(
      id,
      session!.user.id
    );
  });
}