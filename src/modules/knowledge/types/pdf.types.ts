export interface ExtractedPdfPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedPdfDocument {
  pages: ExtractedPdfPage[];
  totalPages: number;
}