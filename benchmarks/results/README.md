# Benchmark run artifacts

Raw terminal output from performance runs is saved here as `YYYYMMDD-<suite>.txt`.

| File pattern | Command |
|--------------|---------|
| `*-cpu-bench.txt` | `npm run bench` |
| `*-embedding.txt` | `npm run bench:embedding` |
| `*-retrieval.txt` | `npm run bench:retrieval` |
| `*-load-health-autocannon.txt` | `npm run load:health` |
| `*-load-k6-*.txt` | `npm run load:k6:*` |

Summaries for humans live in [docs/performance/performance-test-report.md](../../docs/performance/performance-test-report.md).
