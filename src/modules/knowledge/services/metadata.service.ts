import { randomUUID } from "crypto";

import { Chunk } from "../types/chunk.types";
import { DocumentMetadata } from "../types/document.types";
import { KnowledgeChunk } from "../types/metadata.types";

export class MetadataService {

  createKnowledgeChunks(
    chunks: Chunk[],
    document: DocumentMetadata
  ): KnowledgeChunk[] {

    return chunks.map(chunk =>
      this.createKnowledgeChunk(
        chunk,
        document
      )
    );

  }

  private createKnowledgeChunk(
    chunk: Chunk,
    document: DocumentMetadata
  ): KnowledgeChunk {

    return {

      id: randomUUID(),

      ...chunk,

      source: {

        documentId:
          document.id,

        title:
          document.title,

        version:
          document.version,

        language:
          document.language,

        sourceType:
          document.sourceType,

        fileName:
          document.fileName,

        checkSum:
          document.checksum,
      },

      structure: {

        pageNumber:
          undefined,

        chapter:
          undefined,

        section:
          undefined,

        headings: [],
      },
    };
  }
}