/**
 * Runs the full local performance suite in order.
 * Requires: .env (retrieval), Ollama, running app on BASE_URL for load steps.
 */
import { spawnSync } from "node:child_process";

const steps: { name: string; cmd: string; args: string[]; needsApp?: boolean }[] =
  [
    { name: "CPU benchmarks (Vitest)", cmd: "npm", args: ["run", "bench"] },
    {
      name: "Embedding benchmark (Ollama)",
      cmd: "npm",
      args: ["run", "bench:embedding"],
    },
    {
      name: "Retrieval benchmark (Ollama + DB)",
      cmd: "npm",
      args: ["run", "bench:retrieval"],
    },
    {
      name: "Health load (autocannon)",
      cmd: "npm",
      args: ["run", "load:health"],
      needsApp: true,
    },
    {
      name: "Chat API load (fetch)",
      cmd: "npm",
      args: ["run", "load:chat"],
      needsApp: true,
    },
    {
      name: "RAG stream smoke (E2E)",
      cmd: "npm",
      args: ["run", "perf:smoke"],
      needsApp: true,
    },
  ];

function runStep(step: (typeof steps)[number]): boolean {
  console.log(`\n========== ${step.name} ==========\n`);
  const result = spawnSync(step.cmd, step.args, {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
  if (result.status !== 0) {
    console.error(`\nFailed: ${step.name} (exit ${result.status})`);
    return false;
  }
  return true;
}

async function healthCheck(): Promise<boolean> {
  const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  console.log("Medbot performance suite — run-all\n");

  for (const step of steps) {
    if (step.needsApp) {
      const up = await healthCheck();
      if (!up) {
        console.error(
          `Skip "${step.name}": app not reachable at ${process.env.BASE_URL ?? "http://127.0.0.1:3000"}. Start with npm run dev or npm run start.`
        );
        process.exitCode = 1;
        continue;
      }
    }
    if (!runStep(step)) {
      process.exitCode = 1;
      break;
    }
  }

  const k6 = process.env.K6_BIN ?? "k6";
  const k6Check = spawnSync(k6, ["version"], { stdio: "pipe" });
  if (k6Check.status !== 0) {
    console.log(
      "\nOptional: install k6 and run load:k6:health, load:k6:chat, load:k6:stream (see docs/performance/performance-testing-guide.md)."
    );
    return;
  }

  const up = await healthCheck();
  if (!up) {
    console.log("\nk6 scenarios skipped — app not running.");
    return;
  }

  for (const script of ["health.js", "chat.js", "stream.js"]) {
    const name = `k6 ${script}`;
    console.log(`\n========== ${name} ==========\n`);
    const result = spawnSync(
      k6,
      ["run", `benchmarks/load/k6/${script}`],
      { stdio: "inherit", env: process.env, cwd: process.cwd() }
    );
    if (result.status !== 0) {
      process.exitCode = 1;
      console.error(`Failed: ${name}`);
    }
  }
}

main();
