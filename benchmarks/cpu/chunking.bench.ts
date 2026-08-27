import { bench, describe } from "vitest";

import { LARGE_PARAGRAPH } from "../../tests/fixtures/knowledge/fixtures";
import { OVERLAP_TEXT } from "../../tests/fixtures/knowledge/fixtures";
import { MEDICAL_TEXT } from "../../tests/fixtures/knowledge/fixtures";
import { ChunkingService } from "../../src/modules/knowledge/services/chunking.serivce";
import { NormalizationService } from "../../src/modules/knowledge/services/normalization.service";
import { RecursiveChunkingStrategy } from "../../src/modules/knowledge/strategies/recursive.strategy";

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
