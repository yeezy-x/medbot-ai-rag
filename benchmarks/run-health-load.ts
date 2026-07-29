import autocannon from "autocannon";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const url = `${baseUrl.replace(/\/$/, "")}/api/health`;

const durationSec = Number(process.env.LOAD_DURATION_SEC ?? 10);
const connections = Number(process.env.LOAD_CONNECTIONS ?? 20);

console.log("\n========== HEALTH LOAD (autocannon) ==========\n");
console.log({ url, durationSec, connections });

const instance = autocannon(
  {
    url,
    connections,
    duration: durationSec,
    pipelining: 1,
  },
  (error, result) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
      return;
    }

    console.log("\n--- Results ---");
    console.table({
      requests: result.requests.total,
      throughputReqSec: Math.round(result.requests.average),
      latencyMeanMs: Math.round(result.latency.mean),
      latencyP50Ms: Math.round(result.latency.p50),
      latencyP95Ms: Math.round(result.latency.p97_5),
      latencyP99Ms: Math.round(result.latency.p99),
      errors: result.errors,
      timeouts: result.timeouts,
      non2xx: result.non2xx,
    });

    const p95 = result.latency.p97_5;
    const sloP95Ms = Number(process.env.SLO_HEALTH_P95_MS ?? 200);
    if (p95 > sloP95Ms) {
      console.warn(
        `\nSLO miss: health p95 ${Math.round(p95)}ms > target ${sloP95Ms}ms`
      );
      process.exitCode = 1;
    }
  }
);

autocannon.track(instance, { renderProgressTable: true });

process.once("SIGINT", () => {
  instance.stop();
});
