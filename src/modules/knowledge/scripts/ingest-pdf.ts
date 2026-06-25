import path from "path";
import { PdfService } from "../services/pdf.service";
import { ChunkingService } from "../services/chunking.serivce";
import { NormalizationService } from "../services/normalization.service";

async function main() {
  const pdfService = new PdfService();
  const chunkingService=new ChunkingService()
  const normalizationService=new NormalizationService()

  const pdfPath = path.resolve(
    process.cwd(),
    "knowledge-base",
    "gale-encyclopedia.pdf"
  );

  const text = await pdfService.extractText(pdfPath);
  const normalizedText=normalizationService.normalize(text)
  const chunks=chunkingService.createChunks(normalizedText )
  console.log("Total Chunks:",chunks.length);
  console.log(chunks[0]);
  console.log("Characters:", text.length);
  console.log(text.slice(0, 2000));
}

main();