import { requireUser } from "@/lib/auth-utils";
import { ChatComposerLauncher } from "@/modules/chat/components/chat-composer-launcher";
import { EmptyState } from "@/modules/chat/components/empty-state";

/*{export default function ChatPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <EmptyState />
      <ChatComposerLauncher />
    </div>
  );
}}*/

export default async function ChatPage() {
  const user = await requireUser();
 
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <EmptyState userName={user.name ?? undefined} />
      </div>
      <ChatComposerLauncher />
    </div>
  );
}