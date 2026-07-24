import {
  RetrievalService,
} from "../services/retrieval.service";

import {
  ContextBuilder,
} from "../builders/context.builder";

import {
  RETRIEVAL_EVALUATION_QUERIES,
} from "../evaluation/retrieval-eval.dataset";

import type {
  RetrievalEvaluationResult,
} from "../types/evaluation.types";

const TOP_K = 10;

const retrievalService =
  new RetrievalService();

const contextBuilder =
  new ContextBuilder();

function calculateAverage(
  values: number[]
): number | null {
  if (values.length === 0) {
    return null;
  }

  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  return total / values.length;
}

function roundScore(
  value: number | null
): number | null {
  if (value === null) {
    return null;
  }

  return Number(
    value.toFixed(4)
  );
}

async function evaluateQuery(
  id: string,
  category:
    RetrievalEvaluationResult["category"],
  query: string
): Promise<RetrievalEvaluationResult> {

  const retrieval =
    await retrievalService.retrieve({
      query,
      topK: TOP_K,
      candidatePoolSize:20,
      minScore: null,
    });

  const context =
    contextBuilder.build(
      retrieval.chunks
    );

  const scores =
    retrieval.chunks.map(
      (chunk) => chunk.score
    );

  const topChunk =
    retrieval.chunks[0] ?? null;

  return {
    id,
    category,
    query,

    retrievedChunkCount:
      retrieval.chunks.length,

    acceptedContextChunkCount:
      context.chunks.length,

    scores:
      scores.map(
        (score) =>
          Number(score.toFixed(4))
      ),

    topScore:
      roundScore(
        scores.length > 0
          ? Math.max(...scores)
          : null
      ),

    lowestScore:
      roundScore(
        scores.length > 0
          ? Math.min(...scores)
          : null
      ),

    averageScore:
      roundScore(
        calculateAverage(scores)
      ),

    topChunkId:
      topChunk?.id ?? null,

    topChunkPageNumber:
      topChunk?.pageNumber ?? null,

    topChunkPreview:
      topChunk
        ? topChunk.content
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 200)
        : null,

    retrievalDurationMs:
      retrieval.durationMs,
  };
}

async function main(): Promise<void> {
  console.log(
    "\n=========================================="
  );

  console.log(
    "     MEDBOT RETRIEVAL BASELINE"
  );

  console.log(
    "==========================================\n"
  );

  console.log({
    totalQueries:
      RETRIEVAL_EVALUATION_QUERIES.length,

    topK:
      TOP_K,
  });

  const results:
    RetrievalEvaluationResult[] = [];

  for (
    let index = 0;
    index <
    RETRIEVAL_EVALUATION_QUERIES.length;
    index++
  ) {
    const evaluationQuery =
      RETRIEVAL_EVALUATION_QUERIES[index];

    console.log(
      `\n[${index + 1}/${
        RETRIEVAL_EVALUATION_QUERIES.length
      }] Evaluating: ${
        evaluationQuery.id
      }`
    );

    console.log(
      `Category: ${
        evaluationQuery.category
      }`
    );

    console.log(
      `Query: ${
        evaluationQuery.query
      }`
    );

    const result =
      await evaluateQuery(
        evaluationQuery.id,
        evaluationQuery.category,
        evaluationQuery.query
      );

    results.push(result);

    console.log({
      retrieved:
        result.retrievedChunkCount,

      accepted:
        result.acceptedContextChunkCount,

      topScore:
        result.topScore,

      lowestScore:
        result.lowestScore,

      averageScore:
        result.averageScore,

      page:
        result.topChunkPageNumber,

      retrievalDurationMs:
        result.retrievalDurationMs,
    });

    console.log(
      "Scores:",
      result.scores
    );

    console.log(
      "Top chunk:",
      result.topChunkPreview
    );
  }

  /*
   * Final compact summary.
   */
  console.log(
    "\n\n=========================================="
  );

  console.log(
    "       RETRIEVAL BASELINE SUMMARY"
  );

  console.log(
    "==========================================\n"
  );

  console.table(
    results.map((result) => ({
      id:
        result.id,

      category:
        result.category,

      retrieved:
        result.retrievedChunkCount,

      accepted:
        result.acceptedContextChunkCount,

      topScore:
        result.topScore,

      averageScore:
        result.averageScore,

      lowestScore:
        result.lowestScore,

      page:
        result.topChunkPageNumber,

      durationMs:
        result.retrievalDurationMs,
    }))
  );

  /*
   * Category-level score analysis.
   */
  const categories = [
    "GROUNDED_MEDICAL",
    "SPECIFIC_MEDICAL",
    "UNSUPPORTED_MEDICAL",
    "NON_MEDICAL",
  ] as const;

  console.log(
    "\n=========================================="
  );

  console.log(
    "       CATEGORY SCORE SUMMARY"
  );

  console.log(
    "==========================================\n"
  );

  for (const category of categories) {
    const categoryResults =
      results.filter(
        (result) =>
          result.category === category
      );

    const topScores =
      categoryResults
        .map(
          (result) =>
            result.topScore
        )
        .filter(
          (score): score is number =>
            score !== null
        );

    const averageScores =
      categoryResults
        .map(
          (result) =>
            result.averageScore
        )
        .filter(
          (score): score is number =>
            score !== null
        );

    console.log({
      category,

      queryCount:
        categoryResults.length,

      minimumTopScore:
        topScores.length > 0
          ? roundScore(
              Math.min(...topScores)
            )
          : null,

      maximumTopScore:
        topScores.length > 0
          ? roundScore(
              Math.max(...topScores)
            )
          : null,

      averageTopScore:
        roundScore(
          calculateAverage(
            topScores
          )
        ),

      averageOfAverageScores:
        roundScore(
          calculateAverage(
            averageScores
          )
        ),
    });
  }

  console.log(
    "\n=========================================="
  );

  console.log(
    "Baseline evaluation completed."
  );

  console.log(
    "Do not choose a similarity threshold"
  );

  console.log(
    "until these score distributions are reviewed."
  );

  console.log(
    "==========================================\n"
  );
}

main().catch((error) => {
  console.error(
    "\n❌ Retrieval baseline evaluation failed:"
  );

  console.error(error);

  process.exit(1);
});