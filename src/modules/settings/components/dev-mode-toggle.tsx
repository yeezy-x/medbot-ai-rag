"use client";

import { useDevMode } from "@/hooks/use-dev-mode";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function DevModeToggle() {
  const [devMode, setDevMode] = useDevMode();

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="dev-mode-toggle">Developer mode</Label>
        <p className="text-[0.78rem] text-muted-foreground">
          Show the Retrieval Inspector and RAG metrics on answers.
        </p>
      </div>
      <Switch
        id="dev-mode-toggle"
        checked={devMode}
        onCheckedChange={(checked) => setDevMode(checked)}
        data-testid="settings-dev-mode-toggle"
      />
    </div>
  );
}
