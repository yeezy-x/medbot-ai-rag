import { Chunk } from "./chunk.types";

export type SourceType = "PDF" | "DOCX" | "MARKDOWN" | "HTML";

export interface SourceMetadata {
  documentId: string;
  title: string;
  sourceType: SourceType;
  version: string;
  language: string;
  fileName?:string;
  checksum?:string
}

export interface StructuralMetadata {
  pageNumber?: number;
  chapter?: string;
  section?: string;
  headings: string[];
}

export interface KnowledgeChunk extends Chunk {
  id: string;
  source: SourceMetadata;
  structure: StructuralMetadata;
}