export interface TimingSummary {
  count: number;
  minMs: number;
  maxMs: number;
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

export function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const index = Math.min(
    sortedAsc.length - 1,
    Math.ceil((p / 100) * sortedAsc.length) - 1
  );
  return sortedAsc[Math.max(0, index)]!;
}

export function summarizeTimings(samplesMs: number[]): TimingSummary {
  if (samplesMs.length === 0) {
    return {
      count: 0,
      minMs: 0,
      maxMs: 0,
      meanMs: 0,
      p50Ms: 0,
      p95Ms: 0,
      p99Ms: 0,
    };
  }

  const sorted = [...samplesMs].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, n) => acc + n, 0);

  return {
    count: sorted.length,
    minMs: sorted[0]!,
    maxMs: sorted[sorted.length - 1]!,
    meanMs: sum / sorted.length,
    p50Ms: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
    p99Ms: percentile(sorted, 99),
  };
}

export async function measureAsync(
  fn: () => Promise<void>,
  iterations: number
): Promise<number[]> {
  const samples: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    samples.push(performance.now() - start);
  }
  return samples;
}

export function printSummary(label: string, summary: TimingSummary): void {
  console.log(`\n--- ${label} ---`);
  console.table({
    count: summary.count,
    minMs: round(summary.minMs),
    meanMs: round(summary.meanMs),
    p50Ms: round(summary.p50Ms),
    p95Ms: round(summary.p95Ms),
    p99Ms: round(summary.p99Ms),
    maxMs: round(summary.maxMs),
  });
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
