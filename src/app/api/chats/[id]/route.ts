// src/app/api/chats/[id]/messages/route.ts
import { auth } from "@/auth";
import { requestHandler } from "@/lib/request-handler";
import { validate } from "@/lib/validate";
import { ChatService, MessageService } from "@/modules/chat/services";
import { askQuestionSchema } from "@/modules/chat/schemas/ask-question.schema";

const chatService = new ChatService();
const messageService = new MessageService();

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  return requestHandler(async () => {
    const session = await auth();
    const { id: sessionId } = await context.params;

    // Verify the chat exists and belongs to this user
    await chatService.getChatById(sessionId, session!.user.id);

    const body = await request.json();
    const data = validate(askQuestionSchema, { ...body, sessionId });

    // Persist the user's message
    const userMessage = await messageService.createUserMessage(
      data.sessionId,
      data.message
    );

    // TODO Phase 6: Replace this stub with RAG pipeline
    // For now, return a placeholder response so the UI works end-to-end
    const assistantMessage = await messageService.createAssistantMessage(
      data.sessionId,
      "RAG pipeline not yet implemented. Your message has been received."
    );

    return {
      userMessage,
      assistantMessage,
    };
  });
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  return requestHandler(async () => {
    const session = await auth();
    const { id: sessionId } = await context.params;

    // Verify ownership
    await chatService.getChatById(sessionId, session!.user.id);

    const messages = await messageService.getConversation(sessionId);
    return messages;
  });
}