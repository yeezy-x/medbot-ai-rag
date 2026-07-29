import { bench, describe } from "vitest";

import { ChunkingService } from "@/modules/knowledge/services/chunking.serivce";
import { NormalizationService } from "@/modules/knowledge/services/normalization.service";
import { RecursiveChunkingStrategy } from "@/modules/knowledge/strategies/recursive.strategy";
import {
  LARGE_PARAGRAPH,
  MEDICAL_TEXT,
  OVERLAP_TEXT,
} from "@/modules/knowledge/__tests__/fixtures";

const chunkingService = new ChunkingService();
const normalizationService = new NormalizationService();
const recursiveStrategy = new RecursiveChunkingStrategy();

describe("knowledge CPU benchmarks", () => {
  bench("chunking: LARGE_PARAGRAPH", () => {
    chunkingService.createChunks(LARGE_PARAGRAPH);
  });

  bench("chunking: OVERLAP_TEXT", () => {
    chunkingService.createChunks(OVERLAP_TEXT);
  });

  bench("chunking: MEDICAL_TEXT", () => {
    chunkingService.createChunks(MEDICAL_TEXT);
  });

  bench("recursive strategy: LARGE_PARAGRAPH", () => {
    recursiveStrategy.chunk(LARGE_PARAGRAPH);
  });

  bench("normalization: LARGE_PARAGRAPH", () => {
    normalizationService.normalize(LARGE_PARAGRAPH);
  });
});
