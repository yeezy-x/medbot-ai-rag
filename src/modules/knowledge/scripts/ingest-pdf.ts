import path from "path";

import { PdfService } from "../services/pdf.service";
import { NormalizationService } from "../services/normalization.service";
import { ChunkingService } from "../services/chunking.serivce";

async function main() {
  console.log("\n====================================");
  console.log("📚 MedBot Knowledge Ingestion");
  console.log("====================================\n");

  const pdfService = new PdfService();
  const normalizationService = new NormalizationService();
  const chunkingService = new ChunkingService();

  const pdfPath = path.resolve(
    process.cwd(),
    "knowledge-base",
    "gale-encyclopedia.pdf"
  );

  console.time("📄 PDF Extraction");

  const rawText =
    await pdfService.extractText(pdfPath);

  console.timeEnd("📄 PDF Extraction");

  console.time("🧹 Text Normalization");

  const normalizationResult = normalizationService.normalize(rawText);
  const normalizedText = normalizationResult.text;

  console.timeEnd("🧹 Text Normalization");

  console.time("✂️ Chunk Generation");

  const chunks =
    chunkingService.createChunks(
      normalizedText
    );

  console.timeEnd("✂️ Chunk Generation");

  console.log("\n========== SUMMARY ==========\n");

  console.table({
    Characters: rawText.length,
    NormalizedCharacters:
      normalizedText.length,
    Chunks: chunks.length,
    AverageChunkSize:
      Math.round(
        normalizedText.length /
          chunks.length
      ),
  });

  console.log("\n========== FIRST CHUNK ==========\n");

  console.log(chunks[0]);

  console.log("\n========== SAMPLE CONTENT ==========\n");

  console.log(
    chunks[0]?.content.slice(0, 500)
  );

  console.log("\n====================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});