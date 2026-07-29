import Link from "next/link";
import { MessageSquarePlus, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardQuickActions() {
  return (
    <Card data-testid="dashboard-quick-actions">
      <CardHeader>
        <CardTitle className="text-[0.95rem]">Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button asChild className="justify-start gap-2">
          <Link href="/chat">
            <MessageSquarePlus className="size-4" />
            New conversation
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/settings">
            <Settings className="size-4" />
            Settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
