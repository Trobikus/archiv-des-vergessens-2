import { spawnSync } from "node:child_process";

const steps = [
  ["typecheck", "npm run typecheck"],
  ["lint", "npm run lint"],
  ["test:coverage", "npm run test:coverage"],
  ["build", "npm run build"],
];

let failed = false;

for (const [name, command] of steps) {
  console.log(`\n==> gate: ${name}`);
  const result = spawnSync(command, {
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    console.error(`gate failed at step: ${name}`);
    failed = true;
    break;
  }
}

if (failed) {
  process.exit(1);
}

console.log("\n==> gate: OK");
