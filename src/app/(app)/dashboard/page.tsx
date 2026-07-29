import { requireUser } from "@/lib/auth-utils";
import { ChatService } from "@/modules/chat/services";

import { DashboardHeader } from "@/modules/dashboard/components/dashboard-header";
import { DashboardEmpty } from "@/modules/dashboard/components/dashboard-empty";
import { DashboardQuickActions } from "@/modules/dashboard/components/dashboard-quick-actions";
import { RecentChats } from "@/modules/dashboard/components/recent-chats";

export default async function DashboardPage() {
  const user = await requireUser();
  const chatService = new ChatService();
  const chats = await chatService.getUserChats(user.id);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-8 sm:px-8">
      <DashboardHeader name={user.name ?? "User"} />

      {chats.length === 0 ? (
        <DashboardEmpty />
      ) : (
        <div className="grid gap-8 md:grid-cols-[minmax(0,280px)_1fr]">
          <DashboardQuickActions />
          <section className="space-y-3">
            <h2 className="text-[0.85rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Recent chats
            </h2>
            <RecentChats chats={chats} />
          </section>
        </div>
      )}
    </div>
  );
}
