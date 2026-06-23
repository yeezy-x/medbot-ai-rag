import { auth } from "@/auth";
import { requestHandler } from "@/lib/request-handler";
import { ChatService } from "@/modules/chat/services";

const chatService=new ChatService();

export async function GET(){
    return requestHandler(
        async()=>{
            const session=await auth();
            return chatService.getUserChats(session!.user.id)
        }
    )
}

export async function POST(request:Request){
    return requestHandler(
        async()=>{
            const session=await auth();
            const body=await request.json()
            return chatService.createChat(
                body.title,
                session!.user.id
            )
        }
    )
}
