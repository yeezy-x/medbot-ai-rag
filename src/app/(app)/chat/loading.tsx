import { ChatSkeleton } from "@/modules/chat/components/chat-skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 p-6">
      <ChatSkeleton />
      <ChatSkeleton />
      <ChatSkeleton />
    </div>
  );
}