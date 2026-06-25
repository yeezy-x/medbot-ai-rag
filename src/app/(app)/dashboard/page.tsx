// app/(app)/dashboard/page.tsx

import { requireUser } from "@/lib/auth-utils";
import { ChatService } from "@/modules/chat/services";

import { DashboardHeader } from "@/modules/dashboard/components/dashboard-header";
import { DashboardEmpty } from "@/modules/dashboard/components/dashboard-empty";
import { RecentChats } from "@/modules/dashboard/components/recent-chats";

export default async function DashboardPage() {
  const user = await requireUser();

  const chatService =
    new ChatService();

  const chats =
    await chatService.getUserChats(
      user.id
    );

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <DashboardHeader
        name={user.name ?? "User"}
      />

      {chats.length === 0 ? (
        <DashboardEmpty />
      ) : (
        <RecentChats
          chats={chats}
        />
      )}
    </div>
  );
}