import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUser } from "@/lib/auth-utils";
import { SettingsForm } from "@/components/settings-form";
import { getLlmRuntime } from "@/config/llm";

export default async function SettingsPage() {
  await requireUser();
  const llm = getLlmRuntime();
  const modelLabel = `${llm.chatModel} (${llm.provider})`;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-[0.8rem] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-[0.875rem] text-muted-foreground">
            Account security is managed by Clerk. Appearance and retrieval
            preferences stay in this browser.
          </p>
        </div>

        <SettingsForm modelLabel={modelLabel} />
      </div>
    </div>
  );
}
