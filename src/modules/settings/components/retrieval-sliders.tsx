"use client";

import { useRetrievalSettings } from "@/hooks/use-retrieval-settings";
import {
  DEFAULT_TOP_K,
  DEFAULT_MIN_SIMILARITY_SCORE,
} from "@/modules/knowledge/constants/retrieval.constants";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export function TopKSlider() {
  const [retrieval, setRetrieval] = useRetrievalSettings();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="top-k-slider">Chunks retrieved (top-K)</Label>
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
        How many chunks the RAG pipeline pulls from pgvector per question.
        Default {DEFAULT_TOP_K}.
      </p>
    </div>
  );
}

export function SimilaritySlider() {
  const [retrieval, setRetrieval] = useRetrievalSettings();

  return (
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
        Minimum cosine-similarity for a chunk to be used. Default{" "}
        {DEFAULT_MIN_SIMILARITY_SCORE.toFixed(2)}.
      </p>
      <div className="flex justify-end pt-2">
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
    </div>
  );
}
