import { describe, expect, it } from "vitest";

import { RecursiveChunkingStrategy } from "@/modules/knowledge/strategies/recursive.strategy";

import {
  SMALL_TEXT,
  LARGE_PARAGRAPH,
  HUGE_WORD,
  EMPTY_TEXT,
  MEDICAL_TEXT,
} from "./fixtures";
import { ChunkingService } from "../services/chunking.serivce";

describe("ChunkingService", () => {
  const service = new ChunkingService();

  describe("createChunks()", () => {
    it("should return an empty array for empty input", () => {
      expect(
        service.createChunks(EMPTY_TEXT)
      ).toEqual([]);
    });

    it("should create one chunk for small text", () => {
      const chunks =
        service.createChunks(SMALL_TEXT);

      expect(chunks).toHaveLength(1);
    });

    it("should split large documents", () => {
      const chunks =
        service.createChunks(LARGE_PARAGRAPH);

      expect(chunks.length).toBeGreaterThan(1);
    });

    it("should split huge words", () => {
      const chunks =
        service.createChunks(HUGE_WORD);

      expect(chunks.length).toBeGreaterThan(1);
    });

    it("should process medical text", () => {
      const chunks =
        service.createChunks(MEDICAL_TEXT);

      expect(chunks.length).toBeGreaterThan(0);
    });

    it("should preserve chunk order", () => {
      const chunks =
        service.createChunks(LARGE_PARAGRAPH);

      chunks.forEach((chunk, index) => {
        expect(chunk.chunkIndex).toBe(index);
      });
    });

    it("should return valid chunk metadata", () => {
      const chunks =
        service.createChunks(SMALL_TEXT);

      expect(chunks[0]).toMatchObject({
        chunkIndex: 0,
        characterCount: expect.any(Number),
        estimatedTokens: expect.any(Number),
        startOffset: expect.any(Number),
        endOffset: expect.any(Number),
      });
    });
  });

  describe("Dependency Injection", () => {
    it("should accept a custom strategy", () => {
      const strategy =
        new RecursiveChunkingStrategy();

      const service =
        new ChunkingService(strategy);

      const chunks =
        service.createChunks(SMALL_TEXT);

      expect(chunks).toHaveLength(1);
    });

    it("should produce identical output to the strategy", () => {
      const strategy =
        new RecursiveChunkingStrategy();

      const service =
        new ChunkingService(strategy);

      const direct =
        strategy.chunk(SMALL_TEXT);

      const throughService =
        service.createChunks(SMALL_TEXT);

      expect(throughService).toEqual(direct);
    });
  });
});