import { spawnSync } from "node:child_process";

const result = spawnSync(
  "npx",
  ["vitest", "run", "packages/content/src/i18n.test.ts"],
  {
    stdio: "inherit",
    shell: true,
  },
);

if (result.status !== 0) {
  console.error("i18n key gate failed");
  process.exit(result.status ?? 1);
}

console.log("i18n key gate OK");
