// src/modules/dashboard/components/dashboard-empty.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DashboardEmpty() {
  return (
    <div className="border rounded-xl p-10 text-center">
      <h2 className="text-xl font-semibold">
        No conversations yet
      </h2>

      <p className="mt-2 text-muted-foreground">
        Start your first medical research chat.
      </p>

      <Button asChild className="mt-6">
        <Link href="/chat">
          New Conversation
        </Link>
      </Button>
    </div>
  );
}