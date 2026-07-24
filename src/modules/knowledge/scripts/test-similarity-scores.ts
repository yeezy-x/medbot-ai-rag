import {
  RetrievalService,
} from "../services/retrieval.service";

interface TestCase {
  category:
    | "highly-relevant"
    | "medical"
    | "ambiguous"
    | "irrelevant";

  query: string;
}

const TEST_CASES: TestCase[] = [
  /*
   * Highly relevant questions that should have
   * direct answers in the Gale Encyclopedia.
   */
  {
    category: "highly-relevant",
    query: "What are the symptoms of AIDS?",
  },
  {
    category: "highly-relevant",
    query: "What are the symptoms of diabetes?",
  },
  {
    category: "highly-relevant",
    query: "How is tuberculosis diagnosed?",
  },
  {
    category: "highly-relevant",
    query: "What causes Alzheimer's disease?",
  },

  /*
   * Medical questions that may or may not have
   * exact matches in the source material.
   */
  {
    category: "medical",
    query: "Why do I have a headache?",
  },
  {
    category: "medical",
    query: "What causes chest pain?",
  },
  {
    category: "medical",
    query: "Why am I feeling tired all the time?",
  },

  /*
   * Ambiguous questions.
   */
  {
    category: "ambiguous",
    query: "What should I do?",
  },
  {
    category: "ambiguous",
    query: "Is this dangerous?",
  },
  {
    category: "ambiguous",
    query: "Can it be cured?",
  },

  /*
   * Completely irrelevant to the medical KB.
   */
  {
    category: "irrelevant",
    query: "How do I make chicken biryani?",
  },
  {
    category: "irrelevant",
    query: "Who won the football World Cup?",
  },
  {
    category: "irrelevant",
    query: "Write TypeScript code for a REST API.",
  },
  {
    category: "irrelevant",
    query: "What is the capital of France?",
  },
];

async function main(): Promise<void> {
  const retrievalService =
    new RetrievalService();

  console.log(
    "\n========== SIMILARITY SCORE CALIBRATION ==========\n"
  );

  const summary: Array<{
    category: string;
    query: string;
    top1: number | null;
    top3Average: number | null;
    top5Average: number | null;
    minimum: number | null;
  }> = [];

  for (const testCase of TEST_CASES) {
    console.log(
      `\n[${testCase.category.toUpperCase()}]`
    );

    console.log(
      `Query: "${testCase.query}"`
    );

    const result =
      await retrievalService.retrieve({
        query: testCase.query,
        topK: 5,
        candidatePoolSize: 20,
        // Deliberately no minScore yet.
      });

    const scores =
      result.chunks.map(
        (chunk) => chunk.score
      );

    const top1 =
      scores[0] ?? null;

    const top3 =
      scores.slice(0, 3);

    const top5 =
      scores.slice(0, 5);

    const top3Average =
      top3.length > 0
        ? average(top3)
        : null;

    const top5Average =
      top5.length > 0
        ? average(top5)
        : null;

    const minimum =
      scores.length > 0
        ? Math.min(...scores)
        : null;

    summary.push({
      category:
        testCase.category,

      query:
        testCase.query,

      top1:
        roundScore(top1),

      top3Average:
        roundScore(top3Average),

      top5Average:
        roundScore(top5Average),

      minimum:
        roundScore(minimum),
    });

    console.table(
      result.chunks.map(
        (chunk, index) => ({
          rank: index + 1,

          score:
            Number(
              chunk.score.toFixed(6)
            ),

          pageNumber:
            chunk.pageNumber,

          source:
            chunk.source.title,

          preview:
            chunk.content
              .replace(/\s+/g, " ")
              .slice(0, 120),
        })
      )
    );
  }

  console.log(
    "\n========== SCORE SUMMARY ==========\n"
  );

  console.table(summary);
}

function average(
  values: number[]
): number {
  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );
}

function roundScore(
  value: number | null
): number | null {
  if (value === null) {
    return null;
  }

  return Number(
    value.toFixed(6)
  );
}

main().catch((error) => {
  console.error(
    "\n❌ SIMILARITY SCORE CALIBRATION FAILED\n"
  );

  console.error(error);

  process.exit(1);
});