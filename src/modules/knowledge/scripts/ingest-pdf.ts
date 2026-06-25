import path from "path";

import { PdfService } from "../services/pdf.service";
import { NormalizationService } from "../services/normalization.service";
import { ChunkingService } from "../services/chunking.serivce";
import { MetadataService } from "../services/metadata.service";
import { randomUUID } from "crypto";

async function main() {
  console.log("\n====================================");
  console.log("📚 MedBot Knowledge Ingestion");
  console.log("====================================\n");

  const pdfService = new PdfService();
  const normalizationService = new NormalizationService();
  const chunkingService = new ChunkingService();
  const metadataService=new MetadataService()

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

  const knowledgeChunks =
    metadataService.createKnowledgeChunks(
      chunks,
      {
        id: randomUUID(),

        title:
          "Gale Encyclopedia of Medicine",

        version: "5th Edition",

        language: "en",

        sourceType: "PDF",

        fileName:
          "gale-encyclopedia.pdf",
      }
    );

  console.table({
    Characters: rawText.length,
    NormalizedCharacters: normalizedText.length,
    Chunks: chunks.length,
    KnowledgeChunks: knowledgeChunks.length,
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

  console.log("\nFIRST KNOWLEDGE CHUNK")
  console.dir(
    knowledgeChunks[0],
    {
      depth: null,
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});