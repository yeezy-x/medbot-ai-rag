import { ReactNode } from "react";

import { requireUser } from "@/lib/auth-utils";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser();

  return (
    <div className="h-screen flex flex-col">

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}