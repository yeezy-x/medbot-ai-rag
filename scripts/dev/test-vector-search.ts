import { RetrievalService } from "@/modules/knowledge/services/retrieval.service";

const TEST_QUERIES = [
  "What are the symptoms of AIDS?",
  "What are the symptoms of diabetes mellitus?",
  "What causes Alzheimer's disease?",
  "What are the symptoms of appendicitis?",
  "How is tuberculosis diagnosed?",
];

async function main(): Promise<void> {
  const retrievalService =
    new RetrievalService();

  console.log(
    "\n========== RAW VECTOR SEARCH TEST ==========\n"
  );

  for (const query of TEST_QUERIES) {
    console.log(
      "\n============================================"
    );

    console.log(`QUERY: ${query}`);

    console.log(
      "============================================\n"
    );

    const result=await retrievalService.retrieve({
        query,
        topK: 5,
        candidatePoolSize: 20,
    });

    console.log({
      query: result.query,
      resultCount: result.chunks.length,
      durationMs: result.durationMs,
    });

    console.log("\nTOP RESULTS:\n");

    result.chunks.forEach(
      (chunk, index) => {
        console.log({
          rank: index + 1,
          score: Number(
            chunk.score.toFixed(4)
          ),
          chunkId: chunk.id,
          documentId: chunk.documentId,
          pageNumber:
            chunk.pageNumber ?? null,
          sourceTitle:
            chunk.source.title,
          sourceType:
            chunk.source.sourceType,
          preview:
            chunk.content
              .replace(/\s+/g, " ")
              .slice(0, 300),
        });

        console.log();
      }
    );

    console.log("\nCITATIONS:\n");

    console.table(result.citations);
  }

  console.log(
    "\n========== TEST COMPLETE ==========\n"
  );
}

main().catch((error) => {
  console.error(
    "\n❌ Vector search test failed:"
  );

  console.error(error);

  process.exit(1);
});