"use client";

import { SettingsPanels } from "@/modules/settings/components/settings-panels";

export function SettingsForm({
  googleAuthEnabled = false,
}: {
  googleAuthEnabled?: boolean;
}) {
  return <SettingsPanels googleAuthEnabled={googleAuthEnabled} />;
}
