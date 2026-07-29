"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "./theme-toggle";
import { FontSizeToggle } from "./font-size-toggle";
import { DevModeToggle } from "./dev-mode-toggle";
import { ModelPicker } from "./model-picker";
import { TopKSlider, SimilaritySlider } from "./retrieval-sliders";

export function SettingsPanels() {
  return (
    <div className="mt-8 space-y-4">
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
