"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "./theme-toggle";
import { FontSizeToggle } from "./font-size-toggle";
import { DevModeToggle } from "./dev-mode-toggle";
import { ModelPicker } from "./model-picker";
import { TopKSlider, SimilaritySlider } from "./retrieval-sliders";
import { MfaSettingsPanel } from "./mfa-settings-panel";
import { AccountRoleBadge } from "./account-role-badge";
import { SessionsPanel } from "./sessions-panel";
import { AccountSecurityPanel } from "./account-security-panel";

export function SettingsPanels({
  googleAuthEnabled = false,
}: {
  googleAuthEnabled?: boolean;
}) {
  return (
    <div className="mt-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-[0.95rem]">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-4">
          <AccountRoleBadge />
          <AccountSecurityPanel googleAuthEnabled={googleAuthEnabled} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[0.95rem]">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-4">
          <div>
            <p className="mb-2 text-sm font-medium">Two-factor authentication</p>
            <MfaSettingsPanel />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Active sessions</p>
            <SessionsPanel />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[0.95rem]">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-4">
          <ThemeToggle />
          <FontSizeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[0.95rem]">Developer</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <DevModeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[0.95rem]">Retrieval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-4">
          <TopKSlider />
          <SimilaritySlider />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[0.95rem]">Model</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <ModelPicker />
        </CardContent>
      </Card>
    </div>
  );
}
