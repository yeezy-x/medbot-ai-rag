"use client";

import { useFontSize, type FontSize } from "@/hooks/use-font-size";
import { Label } from "@/components/ui/label";

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Default" },
  { value: "lg", label: "Large" },
];

export function FontSizeToggle() {
  const [fontSize, setFontSize] = useFontSize();

  return (
    <div className="space-y-2">
      <Label>Font size</Label>
      <div
        className="inline-flex rounded-md border border-border-subtle p-0.5"
        role="radiogroup"
        aria-label="Font size"
      >
        {FONT_SIZES.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={fontSize === opt.value}
            onClick={() => setFontSize(opt.value)}
            data-testid={`settings-font-size-${opt.value}`}
            className={`rounded-[5px] px-3 py-1.5 text-[0.78rem] transition-colors ${
              fontSize === opt.value
                ? "bg-brand-muted text-brand"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
