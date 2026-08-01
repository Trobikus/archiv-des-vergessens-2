import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const steps = [
  ["balancing-snapshot", "node tools/gates/balancing-snapshot.mjs"],
  ["i18n-keys", "node tools/gates/i18n-keys.mjs"],
  ["version-parity", "node tools/gates/version-parity.mjs"],
  ["a11y-basis", "node tools/gates/a11y-basis.mjs"],
  ["perf-budgets", "node tools/gates/perf-budgets.mjs"],
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

function hasCommand(command) {
  return (
    spawnSync(command, ["--version"], {
      shell: true,
      stdio: "ignore",
    }).status === 0
  );
}

function runStep(name, command) {
  console.log(`\n==> gate: ${name}`);
  const result = spawnSync(command, {
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    console.error(`gate failed at step: ${name}`);
    failed = true;
  }
}

if (!failed && process.env.SKIP_CLIPPY !== "1") {
  if (hasCommand("cargo")) {
    runStep("clippy", "npm run clippy -w @adv/desktop");
  } else {
    console.log("\n==> gate: clippy skipped (cargo not found)");
  }
}

if (!failed && process.env.SKIP_E2E !== "1") {
  const e2eDir = join(dirname(fileURLToPath(import.meta.url)), "..", "e2e");
  const probe = spawnSync(
    "npx",
    ["playwright", "install", "--dry-run", "chromium"],
    {
      cwd: e2eDir,
      shell: true,
      encoding: "utf8",
    },
  );
  const dryRunOut = `${probe.stdout ?? ""}${probe.stderr ?? ""}`;
  const browsersReady =
    probe.status === 0 &&
    !/will be installed|is not installed|doesn't exist/i.test(dryRunOut);

  if (browsersReady) {
    runStep("e2e", "npm run e2e");
  } else {
    console.log(
      "\n==> gate: e2e skipped (playwright chromium not installed; run: npx playwright install chromium)",
    );
  }
}

if (failed) {
  process.exit(1);
}

console.log("\n==> gate: OK");
