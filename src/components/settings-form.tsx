"use client";

import { SettingsPanels } from "@/modules/settings/components/settings-panels";

export function SettingsForm({ modelLabel }: { modelLabel: string }) {
  return <SettingsPanels modelLabel={modelLabel} />;
}
