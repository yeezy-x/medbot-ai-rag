import ChatLayout from "@/modules/chat/components/chat-layout";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChatLayout>{children}</ChatLayout>;
}
