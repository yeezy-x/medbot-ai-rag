export interface DocumentMetadata {
  id: string;

  title: string;

  version: string;

  language: string;

  sourceType: "PDF";

  fileName: string;

  checksum?: string;
}