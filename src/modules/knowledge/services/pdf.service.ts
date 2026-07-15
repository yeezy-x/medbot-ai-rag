import fs from "node:fs";
import { PDFParse } from "pdf-parse";

export class PdfService {
  async extractText(pdfPath: string): Promise<string> {
    // Read file synchronously into a memory buffer
    const buffer = fs.readFileSync(pdfPath);

    // Feed the synchronous buffer directly into the parser metadata payload
    const parser = new PDFParse({ data: buffer });
    
    const result = await parser.getText();
    await parser.destroy();
    
    return result.text;
  }
}