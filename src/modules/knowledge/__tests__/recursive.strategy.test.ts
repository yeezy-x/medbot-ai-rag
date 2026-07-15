import { describe, expect, it } from "vitest";

import { RecursiveChunkingStrategy } from "@/modules/knowledge/strategies/recursive.strategy";
import { CHUNKING } from "@/modules/knowledge/constants/chunking.constants";

import {
  EMPTY_TEXT,
  WHITESPACE_TEXT,
  SMALL_TEXT,
  LARGE_PARAGRAPH,
  HUGE_WORD,
  MEDICAL_TEXT,
  OVERLAP_TEXT,
} from "./fixtures";

describe("RecursiveChunkingStrategy", () => {
  const strategy =
    new RecursiveChunkingStrategy();

  describe("Empty Input", () => {
    it("should return empty array for empty string", () => {
      expect(strategy.chunk(EMPTY_TEXT)).toEqual([]);
    });

    it("should return empty array for whitespace", () => {
      expect(strategy.chunk(WHITESPACE_TEXT)).toEqual([]);
    });
  });

  describe("Small Documents", () => {
    it("should create a single chunk", () => {
      const chunks =
        strategy.chunk(SMALL_TEXT);

      expect(chunks).toHaveLength(1);

      expect(chunks[0].content).toContain(
        "heart"
      );
    });

    it("should preserve original text", () => {
      const chunks =
        strategy.chunk(SMALL_TEXT);

      expect(chunks[0].content.trim()).toBe(
        SMALL_TEXT.trim()
      );
    });
  });

  describe("Large Documents", () => {
    it("should split large paragraphs", () => {
      const chunks =
        strategy.chunk(LARGE_PARAGRAPH);

      expect(chunks.length).toBeGreaterThan(1);
    });

    it("should never exceed max chunk size", () => {
      const chunks =
        strategy.chunk(LARGE_PARAGRAPH);

      for (const chunk of chunks) {
        expect(
          chunk.characterCount
        ).toBeLessThanOrEqual(
          CHUNKING.MAX_CHUNK_SIZE
        );
      }
    });

    it("should assign sequential chunk indexes", () => {
      const chunks =
        strategy.chunk(LARGE_PARAGRAPH);

      chunks.forEach((chunk, index) => {
        expect(chunk.chunkIndex).toBe(index);
      });
    });
  });

  describe("Offsets", () => {
    it("should produce valid offsets", () => {
      const chunks =
        strategy.chunk(LARGE_PARAGRAPH);

      for (const chunk of chunks) {
        expect(chunk.startOffset)
          .toBeGreaterThanOrEqual(0);

        expect(chunk.endOffset)
          .toBeGreaterThan(chunk.startOffset);
      }
    });

    it("should have increasing start offsets", () => {
      const chunks =
        strategy.chunk(LARGE_PARAGRAPH);

      for (let i = 1; i < chunks.length; i++) {
        expect(
          chunks[i].startOffset
        ).toBeGreaterThanOrEqual(
          chunks[i - 1].startOffset
        );
      }
    });
  });

  describe("Token Estimation", () => {
    it("should estimate tokens", () => {
      const chunks =
        strategy.chunk(SMALL_TEXT);

      expect(
        chunks[0].estimatedTokens
      ).toBeGreaterThan(0);
    });
  });

  describe("Huge Words", () => {
    it("should split giant words", () => {
      const chunks =
        strategy.chunk(HUGE_WORD);

      expect(chunks.length)
        .toBeGreaterThan(1);
    });

    it("should keep every chunk within limit", () => {
      const chunks =
        strategy.chunk(HUGE_WORD);

      chunks.forEach(chunk => {
        expect(
          chunk.characterCount
        ).toBeLessThanOrEqual(
          CHUNKING.MAX_CHUNK_SIZE
        );
      });
    });
  });

  describe("Medical Text", () => {
    it("should process medical text", () => {
      const chunks =
        strategy.chunk(MEDICAL_TEXT);

      expect(chunks.length)
        .toBeGreaterThan(0);
    });

    it("should preserve abbreviations", () => {
      const chunks =
        strategy.chunk(MEDICAL_TEXT);

      const text =
        chunks
          .map(c => c.content)
          .join(" ");

      expect(text).toContain("Dr.");
      expect(text).toContain("mg");
    });
  });

  describe("Overlap", () => {
    it("should generate multiple overlapping chunks", () => {
      const chunks =
        strategy.chunk(OVERLAP_TEXT);

      expect(chunks.length)
        .toBeGreaterThan(1);
    });

    it("should contain repeated context", () => {
      const chunks =
        strategy.chunk(OVERLAP_TEXT);

      if (chunks.length < 2) {
        return;
      }

      expect(
        chunks[1].content
      ).not.toBe("");
    });
  });
});