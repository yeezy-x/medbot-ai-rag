import { SourceType } from "./metadata.types";

export interface DocumentMetadata {
  id: string;
  title: string;
  version: string;
  language: string;
  sourceType: SourceType;
  fileName: string;
  checksum?: string;
}