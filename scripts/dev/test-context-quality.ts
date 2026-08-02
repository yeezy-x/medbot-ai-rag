import {
  RetrievalService,
} from "@/modules/knowledge/services/retrieval.service";

import {
  ContextBuilder,
} from "@/modules/knowledge/builders/context.builder";

import {
  MAX_CONTEXT_CHARACTERS,
} from "@/modules/knowledge/constants/context.constants";

async function main(): Promise<void> {
  const retrievalService =
    new RetrievalService();

  const contextBuilder =
    new ContextBuilder();

  const query =
    "What are the symptoms of AIDS?";

  console.log(
    "\n========== CONTEXT QUALITY TEST ==========\n"
  );

  const retrieval =
    await retrievalService.retrieve({
      query,
      topK: 5,
      candidatePoolSize: 20,
    });

  const context =
    contextBuilder.build(
      retrieval.chunks
    );

  /*
   * Basic existence checks.
   */

  if (
    retrieval.chunks.length > 0 &&
    context.chunks.length === 0
  ) {
    throw new Error(
      "Retrieved chunks exist, but ContextBuilder produced zero chunks."
    );
  }

  if (
    context.chunks.length > 0 &&
    context.text.trim().length === 0
  ) {
    throw new Error(
      "Context contains chunks but has empty text."
    );
  }

  /*
   * Budget verification.
   */

  if (
    context.totalCharacters >
    MAX_CONTEXT_CHARACTERS
  ) {
    throw new Error(
      `Context exceeded character budget: ` +
      `${context.totalCharacters} > ` +
      `${MAX_CONTEXT_CHARACTERS}.`
    );
  }

  if (
    context.totalCharacters !==
    context.text.length
  ) {
    throw new Error(
      "Context totalCharacters does not match actual text length."
    );
  }

  /*
   * Verify that every accepted context chunk
   * originated from retrieval.
   */

  const retrievedIds =
    new Set(
      retrieval.chunks.map(
        (chunk) => chunk.id
      )
    );

  for (
    const chunk of context.chunks
  ) {
    if (
      !retrievedIds.has(chunk.id)
    ) {
      throw new Error(
        `Context chunk ${chunk.id} ` +
        `was not present in retrieval results.`
      );
    }

    if (
      !context.text.includes(
        chunk.content
      )
    ) {
      throw new Error(
        `Context text does not contain ` +
        `content for chunk ${chunk.id}.`
      );
    }

    if (
      !context.text.includes(
        `Source: ${chunk.source}`
      )
    ) {
      throw new Error(
        `Context text is missing source ` +
        `for chunk ${chunk.id}.`
      );
    }

    if (
      chunk.pageNumber !== undefined &&
      !context.text.includes(
        `Page: ${chunk.pageNumber}`
      )
    ) {
      throw new Error(
        `Context text is missing page number ` +
        `for chunk ${chunk.id}.`
      );
    }
  }

  console.log({
    query,
    retrievedChunks:
      retrieval.chunks.length,

    acceptedContextChunks:
      context.chunks.length,

    totalCharacters:
      context.totalCharacters,

    estimatedTokens:
      context.totalEstimatedTokens,

    maxCharacters:
      MAX_CONTEXT_CHARACTERS,
  });

  console.log(
    "\n========== FINAL CONTEXT ==========\n"
  );

  console.log(
    context.text
  );

  console.log(
    "\n✅ CONTEXT QUALITY TEST PASSED\n"
  );

  const emptyContext =
  contextBuilder.build([]);

if (
  emptyContext.chunks.length !== 0
) {
  throw new Error(
    "Empty retrieval should produce zero context chunks."
  );
}

if (
  emptyContext.text !== ""
) {
  throw new Error(
    "Empty retrieval should produce empty context text."
  );
}

if (
  emptyContext.totalCharacters !== 0
) {
  throw new Error(
    "Empty retrieval should produce zero characters."
  );
}

if (
  emptyContext.totalEstimatedTokens !== 0
) {
  throw new Error(
    "Empty retrieval should produce zero estimated tokens."
  );
}

console.log(
  "✅ Empty-context behavior verified"
);

const largeRetrieval =
  await retrievalService.retrieve({
    query:
      "What are the symptoms, causes, diagnosis, treatment, and complications of disease?",
    topK: 50,
    candidatePoolSize: 100,
  });

const boundedContext =
  contextBuilder.build(
    largeRetrieval.chunks
  );

if (
  boundedContext.totalCharacters >
  MAX_CONTEXT_CHARACTERS
) {
  throw new Error(
    "Large context exceeded maximum character budget."
  );
}

console.log({
  largeRetrievedChunks:
    largeRetrieval.chunks.length,

  acceptedChunks:
    boundedContext.chunks.length,

  rejectedByBudget:
    largeRetrieval.chunks.length -
    boundedContext.chunks.length,

  totalCharacters:
    boundedContext.totalCharacters,

  maxCharacters:
    MAX_CONTEXT_CHARACTERS,
});

console.log(
  "✅ Context budget enforcement verified"
);
}

main().catch((error) => {
  console.error(
    "\n❌ CONTEXT QUALITY TEST FAILED\n"
  );

  console.error(error);

  process.exit(1);
});