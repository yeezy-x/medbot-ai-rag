// scripts/ingest-pdf.ts
import "dotenv/config";
import path from "path";
import fs from "fs";

import { IngestionService } from "@/modules/knowledge/services/ingestion.service";

async function main() {
  console.log("\n====================================");
  console.log("📚 MedBot Knowledge Ingestion");
  console.log("====================================\n");

  // 1. Accept CLI arguments for the PDF filename/path (defaulting to gale-encyclopedia.pdf)
  const fileName = process.argv[2] || "gale-encyclopedia.pdf";
  const pdfPath = path.resolve(
    process.cwd(),
    "knowledge-base",
    fileName
  );

  // 2. Validate file existence before processing
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ Error: File not found at ${pdfPath}`);
    process.exit(1);
  }

  const ingestionService = new IngestionService();

  console.time("🚀 Total Ingestion");

  try {
    const result = await ingestionService.ingest(
      pdfPath,
      {
        title: "Gale Encyclopedia of Medicine",
        version: "5th Edition",
        language: "en",
        sourceType: "PDF",
      }
    );

    console.timeEnd("🚀 Total Ingestion");

    console.log("\n========== RESULT ==========\n");
    console.table(result);
    console.log("\n====================================\n");
  } catch (error) {
    console.error("❌ Ingestion failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});