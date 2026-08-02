import { requireApiUser } from "@/lib/auth-utils";
import { requestHandler } from "@/lib/request-handler";
import { ChatService } from "@/modules/chat/services";

const chatService = new ChatService();

export async function GET() {
  return requestHandler(async () => {
    const user = await requireApiUser();
    return chatService.getUserChats(user.id);
  });
}

export async function POST(request: Request) {
  return requestHandler(async () => {
    const user = await requireApiUser();
    const body = await request.json();
    return chatService.createChat(body.title, user.id);
  });
}
