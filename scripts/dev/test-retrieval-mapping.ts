import {
  RetrievalService,
} from "@/modules/knowledge/services/retrieval.service";

async function main(): Promise<void> {
  const retrievalService =
    new RetrievalService();

  const query =
    "What are the symptoms of AIDS?";

  console.log(
    "\n========== RETRIEVAL MAPPING TEST ==========\n"
  );

  const result =
    await retrievalService.retrieve({
      query,
      topK: 5,
      candidatePoolSize: 20,
    });

  console.log({
    query: result.query,
    chunkCount: result.chunks.length,
    citationCount: result.citations.length,
    durationMs: result.durationMs,
  });

  if (result.query !== query) {
    throw new Error(
      "RetrievalResult query does not match the original query."
    );
  }

  if (result.chunks.length !== 5) {
    throw new Error(
      `Expected 5 chunks, received ${result.chunks.length}.`
    );
  }

  if (
    result.citations.length !==
    result.chunks.length
  ) {
    throw new Error(
      "Citation count does not match chunk count."
    );
  }

  for (
    let index = 0;
    index < result.chunks.length;
    index++
  ) {
    const chunk = result.chunks[index];
    const citation =
      result.citations[index];

    if (!chunk) {
      throw new Error(
        `Missing chunk at index ${index}.`
      );
    }

    if (!citation) {
      throw new Error(
        `Missing citation at index ${index}.`
      );
    }

    if (!chunk.id) {
      throw new Error(
        `Chunk ${index} is missing id.`
      );
    }

    if (!chunk.documentId) {
      throw new Error(
        `Chunk ${index} is missing documentId.`
      );
    }

    if (!chunk.content.trim()) {
      throw new Error(
        `Chunk ${index} has empty content.`
      );
    }

    if (!Number.isFinite(chunk.score)) {
      throw new Error(
        `Chunk ${index} has invalid score.`
      );
    }

    if (chunk.pageNumber === undefined) {
      throw new Error(
        `Chunk ${index} is missing pageNumber.`
      );
    }

    if (!chunk.source.title.trim()) {
      throw new Error(
        `Chunk ${index} is missing source title.`
      );
    }

    if (!chunk.source.version.trim()) {
      throw new Error(
        `Chunk ${index} is missing source version.`
      );
    }

    if (!chunk.source.language.trim()) {
      throw new Error(
        `Chunk ${index} is missing source language.`
      );
    }

    if (!chunk.source.sourceType) {
      throw new Error(
        `Chunk ${index} is missing sourceType.`
      );
    }

    /*
     * Verify citation mapping.
     */

    if (
      citation.chunkId !==
      chunk.id
    ) {
      throw new Error(
        `Citation chunkId mismatch at index ${index}.`
      );
    }

    if (
      citation.documentId !==
      chunk.documentId
    ) {
      throw new Error(
        `Citation documentId mismatch at index ${index}.`
      );
    }

    if (
      citation.pageNumber !==
      chunk.pageNumber
    ) {
      throw new Error(
        `Citation pageNumber mismatch at index ${index}.`
      );
    }

    if (
      citation.sourceTitle !==
      chunk.source.title
    ) {
      throw new Error(
        `Citation sourceTitle mismatch at index ${index}.`
      );
    }

    console.log({
      rank: index + 1,
      chunkId: chunk.id,
      documentId:
        chunk.documentId,
      score:
        Number(chunk.score.toFixed(4)),
      pageNumber:
        chunk.pageNumber,
      sourceTitle:
        chunk.source.title,
      version:
        chunk.source.version,
      language:
        chunk.source.language,
      sourceType:
        chunk.source.sourceType,
      headings:
        chunk.headings,
      preview:
        chunk.content
          .replace(/\s+/g, " ")
          .slice(0, 200),
    });
  }

  console.log(
    "\n========== CITATIONS ==========\n"
  );

  console.table(
    result.citations
  );

  console.log(
    "\n✅ RETRIEVAL MAPPING TEST PASSED\n"
  );
}

main().catch((error) => {
  console.error(
    "\n❌ RETRIEVAL MAPPING TEST FAILED\n"
  );

  console.error(error);

  process.exit(1);
});