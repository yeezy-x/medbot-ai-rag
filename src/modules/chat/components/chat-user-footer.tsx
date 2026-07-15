import { requireUser } from "@/lib/auth-utils";

export async function ChatUserFooter() {
  const user = await requireUser();

  return (
    <div>
      <div className="font-medium text-sm">
        {user.name}
      </div>

      <div className="text-xs text-muted-foreground">
        {user.email}
      </div>
    </div>
  );
}