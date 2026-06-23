import {
  Sidebar,
} from "@/modules/chat/components/chat-sidebar";

export default function ChatLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="flex">

      <Sidebar />

      <main>
        {children}
      </main>

    </div>
  );
}