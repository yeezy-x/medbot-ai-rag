import { requireUser } from "@/lib/auth-utils";
import { ChatComposerLauncher } from "@/modules/chat/components/chat-composer-launcher";
import { EmptyState } from "@/modules/chat/components/empty-state";

export default async function ChatPage() {
  const user = await requireUser();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <EmptyState userName={user.name ?? undefined} />
      </div>
      <div className="shrink-0">
        <ChatComposerLauncher />
      </div>
    </div>
  );
}
