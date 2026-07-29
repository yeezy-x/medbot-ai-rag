"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="theme-toggle">Theme</Label>
        <p className="text-[0.78rem] text-muted-foreground">
          Switch between dark and light mode.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Sun className="size-3.5 text-muted-foreground" aria-hidden />
        <Switch
          id="theme-toggle"
          checked={theme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          data-testid="settings-theme-toggle"
        />
        <Moon className="size-3.5 text-muted-foreground" aria-hidden />
      </div>
    </div>
  );
}
