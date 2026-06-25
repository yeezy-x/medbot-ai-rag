import { describe, expect, it } from "vitest";

import { MetadataService } from "@/modules/knowledge/services/metadata.service";
import { DocumentMetadata } from "@/modules/knowledge/types/document.types";
import { Chunk } from "@/modules/knowledge/types/chunk.types";

describe("MetadataService", () => {
  const service = new MetadataService();

  const document: DocumentMetadata = {
    id: "doc-1",
    title: "Gale Encyclopedia of Medicine",
    version: "5th Edition",
    language: "en",
    sourceType: "PDF",
    fileName: "gale.pdf",
  };

  const chunks: Chunk[] = [
    {
      chunkIndex: 0,
      content: "Heart disease is common.",
      characterCount: 24,
      estimatedTokens: 6,
      startOffset: 0,
      endOffset: 24,
    },
    {
      chunkIndex: 1,
      content: "Treatment depends on severity.",
      characterCount: 30,
      estimatedTokens: 8,
      startOffset: 24,
      endOffset: 54,
    },
  ];

  describe("createKnowledgeChunks()", () => {

    it("creates one KnowledgeChunk per Chunk", () => {
      const result =
        service.createKnowledgeChunks(
          chunks,
          document
        );

      expect(result).toHaveLength(2);
    });

    it("preserves chunk content", () => {
      const result =
        service.createKnowledgeChunks(
          chunks,
          document
        );

      expect(result[0].content)
        .toBe(chunks[0].content);
    });

    it("copies chunk metadata", () => {
      const result =
        service.createKnowledgeChunks(
          chunks,
          document
        );

      expect(result[0].chunkIndex)
        .toBe(0);

      expect(result[0].startOffset)
        .toBe(0);

      expect(result[0].endOffset)
        .toBe(24);
    });

    it("assigns unique ids", () => {
      const result =
        service.createKnowledgeChunks(
          chunks,
          document
        );

      expect(result[0].id)
        .not.toBe(result[1].id);
    });

    it("copies document metadata", () => {
      const result =
        service.createKnowledgeChunks(
          chunks,
          document
        );

      expect(result[0].source.title)
        .toBe(document.title);

      expect(result[0].source.fileName)
        .toBe(document.fileName);
    });

    it("initializes empty structure", () => {
      const result =
        service.createKnowledgeChunks(
          chunks,
          document
        );

      expect(result[0].structure)
        .toEqual({
          pageNumber: undefined,
          chapter: undefined,
          section: undefined,
          headings: [],
        });
    });

    it("returns empty array when no chunks exist", () => {
      expect(
        service.createKnowledgeChunks(
          [],
          document
        )
      ).toEqual([]);
    });

  });
});