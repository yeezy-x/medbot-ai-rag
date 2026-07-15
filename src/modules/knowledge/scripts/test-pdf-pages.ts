import path from "node:path";

import { PdfService } from "../services/pdf.service";
import { NormalizationService } from "../services/normalization.service";
import { ChunkingService } from "../services/chunking.serivce";
import { MetadataService } from "../services/metadata.service";


async function main() {
  const pdfService = new PdfService();
  const normalizationService =
    new NormalizationService();
  const chunkingService =
    new ChunkingService();
  const metadataService =
    new MetadataService();

  const pdfPath = path.resolve(
    process.cwd(),
    "knowledge-base",
    "gale-encyclopedia.pdf"
  );

  console.time("PDF page extraction");

  const document =
    await pdfService.extractPages(pdfPath);

  console.timeEnd("PDF page extraction");

  const normalizedPages = document.pages
    .map((page) => ({
      pageNumber: page.pageNumber,

      text: normalizationService
        .normalize(page.text)
        .text,
    }))
    .filter(
      (page) =>
        page.text.trim().length > 0
    );

  console.time("Page-aware chunking");

  const chunks =
    chunkingService.createChunksFromPages(
      normalizedPages
    );

  console.timeEnd("Page-aware chunking");

  console.log(
    "\n========== PAGE-AWARE CHUNK TEST ==========\n"
  );

  console.log({
    totalPdfPages:
      document.totalPages,

    nonEmptyPages:
      normalizedPages.length,

    totalChunks:
      chunks.length,

    chunksWithoutPageNumber:
      chunks.filter(
        (chunk) =>
          chunk.pageNumber === undefined
      ).length,

    firstChunk:
      chunks[0],

    lastChunk:
      chunks.at(-1),
  });

  console.log(
    "\n========== PAGE 177 CHUNKS ==========\n"
  );

  const page177Chunks =
    chunks.filter(
      (chunk) =>
        chunk.pageNumber === 177
    );

  console.log({
    count: page177Chunks.length,

    chunkIndexes:
      page177Chunks.map(
        (chunk) => chunk.chunkIndex
      ),
  });

  for (const chunk of page177Chunks) {
    console.log({
      chunkIndex:
        chunk.chunkIndex,

      pageNumber:
        chunk.pageNumber,

      characterCount:
        chunk.characterCount,

      preview:
        chunk.content.slice(0, 150),
    });
  }

  console.log(
    "\n====================================\n"
  );

  const knowledgeChunks =
  metadataService.createKnowledgeChunks(
    chunks,
    {
      id: "test-document-id",
      title: "Gale Encyclopedia of Medicine",
      version: "5th Edition",
      language: "en",
      sourceType: "PDF",
      fileName: "gale-encyclopedia.pdf",
    }
  );
  console.log(
  "\n========== METADATA PAGE TEST ==========\n"
);

const page177KnowledgeChunks =
  knowledgeChunks.filter(
    (chunk) =>
      chunk.structure.pageNumber === 177
  );

console.log({
  totalKnowledgeChunks:
    knowledgeChunks.length,

  knowledgeChunksWithoutPageNumber:
    knowledgeChunks.filter(
      (chunk) =>
        chunk.structure.pageNumber === undefined
    ).length,

  page177KnowledgeChunkCount:
    page177KnowledgeChunks.length,

  sample:
    page177KnowledgeChunks[0],
});

console.log(
  "\n====================================\n"
);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});