import "dotenv/config";

import { RetrievalService } from "@/modules/knowledge/services/retrieval.service";
import {
  DEFAULT_CANDIDATE_POOL_SIZE,
  DEFAULT_TOP_K,
} from "@/modules/knowledge/constants/retrieval.constants";
import {
  measureAsync,
  printSummary,
  summarizeTimings,
} from "../lib/stats";

const QUERIES = [
  "What are the symptoms of diabetes?",
  "How is hypertension treated?",
  "What vaccines are recommended for adults?",
];

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required for retrieval benchmarks.");
    process.exitCode = 1;
    return;
  }

  const iterations = Number(process.env.BENCH_ITERATIONS ?? 5);
  const service = new RetrievalService();

  console.log("\n========== RETRIEVAL BENCHMARK ==========\n");
  console.log(`Iterations per query: ${iterations}`);
  console.log(`topK=${DEFAULT_TOP_K}, pool=${DEFAULT_CANDIDATE_POOL_SIZE}\n`);

  try {
    await service.retrieve({
      query: "warmup query",
      topK: DEFAULT_TOP_K,
      candidatePoolSize: DEFAULT_CANDIDATE_POOL_SIZE,
    });
  } catch (error) {
    console.error(
      "Retrieval warmup failed. Ensure Ollama and the database are up and knowledge is ingested."
    );
    console.error(error);
    process.exitCode = 1;
    return;
  }

  const allSamples: number[] = [];

  for (const query of QUERIES) {
    const samples = await measureAsync(async () => {
      await service.retrieve({
        query,
        topK: DEFAULT_TOP_K,
        candidatePoolSize: DEFAULT_CANDIDATE_POOL_SIZE,
      });
    }, iterations);
    allSamples.push(...samples);
    printSummary(`retrieve: ${query.slice(0, 48)}…`, summarizeTimings(samples));
  }

  printSummary("retrieve: ALL QUERIES", summarizeTimings(allSamples));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
