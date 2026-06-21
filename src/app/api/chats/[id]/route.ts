import { auth } from "@/auth";
import { requestHandler } from "@/lib/request-handler";
import { ChatService } from "@/modules/chat/services";

const chatService=new ChatService();

export async function GET(request:Request,
    {params}:{params:{id:string}}
){
    return requestHandler(
        async()=>{
            const session=await auth();
            return chatService.getChatById(params.id,session!.user.id)
        }
    )
}

export async function DELETE(request:Request,{params}:{params:{id:string}}){
    return requestHandler(
        async()=>{
            const session=await auth();
            return chatService.deleteChat(params.id,session!.user.id)
        }
    )
}