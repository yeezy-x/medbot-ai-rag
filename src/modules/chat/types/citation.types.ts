export interface CitationDisplay {
  id: string;
  chunkId: string;
  documentId: string;
  pageNumber: number;
  sourceTitle: string;
}

/** Opened-source state pushed into the split-view SourceViewer. */
export interface OpenedSource {
  documentId: string;
  pageNumber: number;
  sourceTitle: string;
  chunkId?: string;
}
