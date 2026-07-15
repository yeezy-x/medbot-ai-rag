import fs from "node:fs";
import { PDFParse } from "pdf-parse";

import {
  ExtractedPdfDocument,
  ExtractedPdfPage,
} from "../types/pdf.types";

export class PdfService {
  /**
   * Reads a PDF file from the filesystem and extracts its content page by page.
   * This is the preferred method for RAG ingestion because knowing the exact
   * page number of a chunk allows you to provide accurate citations to the user.
   *
   * @param pdfPath - The absolute or relative file path to the PDF document.
   * @returns An object containing the total page count and an array of individual pages.
   */
  async extractPages(
    pdfPath: string
  ): Promise<ExtractedPdfDocument> {
    
    // 1. Load the file into memory synchronously. 
    // For massive PDFs in a production environment, you might eventually 
    // want to stream this, but a buffer is perfectly fine for standard documents.
    const buffer = fs.readFileSync(pdfPath);

    // 2. Initialize the PDF parser with the file buffer.
    const parser = new PDFParse({
      data: buffer,
    });

    try {
      // 3. Execute the parsing operation to extract raw text data.
      const result = await parser.getText();

      // 4. Transform the raw parser output into our domain-specific types.
      // We map over the pages to attach a 1-based index (pageNumber) to each text block.
      // This metadata is crucial for the ContextBuilder and Citations later on.
      const pages: ExtractedPdfPage[] = result.pages.map(
        (page, index) => ({
          pageNumber: index + 1,
          text: page.text,
        })
      );

      // 5. Return the structured document ready for the Chunking phase.
      return {
        pages,
        totalPages: pages.length,
      };
      
    } finally {
      // 6. Resource Management: Always destroy the parser instance in a 'finally' block.
      // This guarantees memory is freed up even if the parsing fails or throws an error,
      // preventing memory leaks during large batch ingestion jobs.
      await parser.destroy();
    }
  }

  /**
   * A utility method that extracts all text from a PDF into a single continuous string.
   * * Useful for basic testing, quick summaries, or legacy ingestion pipelines 
   * where page-level metadata/citations are not required.
   *
   * @param pdfPath - The absolute or relative file path to the PDF document.
   * @returns A single string containing all text from the document.
   */
  async extractText(
    pdfPath: string
  ): Promise<string> {
    
    // 1. Leverage the robust extractPages method to do the heavy lifting.
    const document = await this.extractPages(pdfPath);

    // 2. Extract just the text from each page object and stitch them together.
    // Using double newlines ensures clear paragraph separation between pages,
    // which helps the chunking algorithm find natural break points.
    return document.pages
      .map((page) => page.text)
      .join("\n\n");
  }
}