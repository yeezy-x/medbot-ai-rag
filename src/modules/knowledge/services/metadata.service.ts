import { randomUUID } from "crypto";

import { Chunk } from "../types/chunk.types";
import { DocumentMetadata } from "../types/document.types";
import { KnowledgeChunk } from "../types/metadata.types";

export class MetadataService {
  /**
   * Batch processes an array of raw text chunks, attaching the parent document's
   * metadata to each one.
   *
   * @param chunks - The array of raw chunks produced by the ChunkingService.
   * @param document - The metadata of the parent PDF/Document being ingested.
   * @returns An array of enriched chunks ready for vector embedding.
   */
  createKnowledgeChunks(
    chunks: Chunk[],
    document: DocumentMetadata
  ): KnowledgeChunk[] {
    return chunks.map((chunk) =>
      this.createKnowledgeChunk(chunk, document)
    );
  }

  /**
   * Transforms a single raw chunk into a rich KnowledgeChunk.
   * This structure is deliberately flat to make filtering and searching 
   * in the Vector Database (like pgvector or Pinecone) highly efficient.
   */
  private createKnowledgeChunk(
    chunk: Chunk,
    document: DocumentMetadata
  ): KnowledgeChunk {
    return {
      // 1. Primary Key: Every chunk needs a globally unique identifier.
      // This ID will eventually be the primary key in your Vector DB.
      id: randomUUID(),

      // 2. Base Payload: Spread the original chunk data (usually just 'text' and 'pageNumber').
      ...chunk,

      // 3. Source Lineage: This object is critical for the ChatService.
      // When the Vector DB returns a matching chunk, this data ensures we can
      // tell the user exactly which file, title, and version the answer came from.
      source: {
        documentId: document.id,
        title: document.title,
        version: document.version,
        language: document.language,
        sourceType: document.sourceType,
        fileName: document.fileName,
        // Checksums prevent duplicate ingestion. If a document changes, 
        // the checksum changes, signaling we need to re-ingest.
        checksum: document.checksum,
      },

      // 4. Structural Context: Prepares the chunk for advanced RAG techniques.
      structure: {
        pageNumber: chunk.pageNumber,
        
        // Placeholders for future enhancements:
        // If you later upgrade your PDF parser to detect bold text or TOCs,
        // you can populate these fields to allow queries like: 
        // "Search only within the 'Introduction' chapter."
        chapter: undefined,
        section: undefined,
        headings: [],
      },
    };
  }
}