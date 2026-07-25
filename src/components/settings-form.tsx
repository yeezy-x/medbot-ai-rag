"use client";

import { Moon, Sun, Cpu } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";
import { useFontSize, type FontSize } from "@/hooks/use-font-size";
import { useDevMode } from "@/hooks/use-dev-mode";
import { useRetrievalSettings } from "@/hooks/use-retrieval-settings";
import {
  DEFAULT_TOP_K,
  DEFAULT_MIN_SIMILARITY_SCORE,
} from "@/modules/knowledge/constants/retrieval.constants";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Default" },
  { value: "lg", label: "Large" },
];

export function SettingsForm() {
  const [theme, setTheme] = useTheme();
  const [fontSize, setFontSize] = useFontSize();
  const [devMode, setDevMode] = useDevMode();
  const [retrieval, setRetrieval] = useRetrievalSettings();

  return (
    <div className="mt-8 space-y-4">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[0.95rem]">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme-toggle">Theme</Label>
              <p className="text-[0.78rem] text-muted-foreground">
                Switch between dark and light mode.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="size-3.5 text-muted-foreground" />
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
                data-testid="settings-theme-toggle"
              />
              <Moon className="size-3.5 text-muted-foreground" />
            </div>
          </div>

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
        </CardContent>
      </Card>

      {/* Developer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[0.95rem]">Developer</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
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
        </CardContent>
      </Card>

      {/* Retrieval */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[0.95rem]">Retrieval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="top-k-slider">
                Chunks retrieved (top-K)
              </Label>
              <span className="text-[0.78rem] tabular-nums text-muted-foreground">
                {retrieval.topK}
              </span>
            </div>
            <Slider
              id="top-k-slider"
              min={1}
              max={20}
              step={1}
              value={[retrieval.topK]}
              onValueChange={([v]) => setRetrieval({ topK: v })}
              data-testid="settings-topk-slider"
            />
            <p className="text-[0.72rem] text-muted-foreground">
              How many chunks the RAG pipeline pulls from pgvector per
              question. Default {DEFAULT_TOP_K}. Higher values give the model
              more context but cost more tokens and latency.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="min-score-slider">Similarity threshold</Label>
              <span className="text-[0.78rem] tabular-nums text-muted-foreground">
                {retrieval.minScore.toFixed(2)}
              </span>
            </div>
            <Slider
              id="min-score-slider"
              min={0}
              max={1}
              step={0.05}
              value={[retrieval.minScore]}
              onValueChange={([v]) => setRetrieval({ minScore: v })}
              data-testid="settings-minscore-slider"
            />
            <p className="text-[0.72rem] text-muted-foreground">
              Minimum cosine-similarity score for a chunk to be considered.
              Default {DEFAULT_MIN_SIMILARITY_SCORE.toFixed(2)}. Raising this
              trades recall for precision — you may get - I dont have
              enough context - more often.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[0.78rem]"
              onClick={() =>
                setRetrieval({
                  topK: DEFAULT_TOP_K,
                  minScore: DEFAULT_MIN_SIMILARITY_SCORE,
                })
              }
              data-testid="settings-retrieval-reset"
            >
              Reset to defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Model — placeholder per roadmap F11, single model today */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[0.95rem]">Model</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5 opacity-60">
            <div className="flex items-center gap-2">
              <Cpu className="size-3.5 text-muted-foreground" />
              <span className="text-[0.82rem]">qwen2.5-coder:3b (Ollama)</span>
            </div>
            <span className="text-[0.7rem] text-muted-foreground">
              Model selection coming soon
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}