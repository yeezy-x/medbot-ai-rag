import { requireApiUser } from "@/lib/auth-utils";
import { requestHandler } from "@/lib/request-handler";
import { validate } from "@/lib/validate";
import { ChatService } from "@/modules/chat/services";
import { askQuestionSchema } from "@/modules/chat/schemas/ask-question.schema";

const chatService = new ChatService();

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const body = await request.json();
    const data = validate(askQuestionSchema, body);
    const { id: chatId } = await context.params;
    return chatService.sendMessage({
      chatId,
      userId: user.id,
      message: data.message,
      topK: data.topK,
      minScore: data.minScore,
    });
  });
}

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
