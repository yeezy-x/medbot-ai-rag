import {
  Sidebar,
} from "@/modules/chat/components/sidebar";

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