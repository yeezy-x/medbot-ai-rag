import "dotenv/config";

import { OllamaEmbeddingProvider } from "@/modules/knowledge/providers/ollama.provider";
import {
  measureAsync,
  printSummary,
  summarizeTimings,
} from "../lib/stats";

const QUERIES = [
  "What are the symptoms of diabetes?",
  "How is hypertension treated?",
  "What vaccines are recommended for adults?",
  "Explain tuberculosis diagnosis.",
  "Side effects of common NSAIDs.",
];

async function main(): Promise<void> {
  const iterations = Number(process.env.BENCH_ITERATIONS ?? 10);
  const provider = new OllamaEmbeddingProvider();

  console.log("\n========== EMBEDDING BENCHMARK ==========\n");
  console.log(`Iterations per query: ${iterations}`);
  console.log(`Queries: ${QUERIES.length}\n`);

  try {
    await provider.embed({ text: "warmup" });
  } catch (error) {
    console.error(
      "Ollama unreachable. Start Ollama and set OLLAMA_BASE_URL if needed."
    );
    console.error(error);
    process.exitCode = 1;
    return;
  }

  const allSamples: number[] = [];

  for (const query of QUERIES) {
    const samples = await measureAsync(async () => {
      await provider.embed({ text: query });
    }, iterations);
    allSamples.push(...samples);
    printSummary(`embed: ${query.slice(0, 48)}…`, summarizeTimings(samples));
  }

  printSummary("embed: ALL QUERIES", summarizeTimings(allSamples));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
