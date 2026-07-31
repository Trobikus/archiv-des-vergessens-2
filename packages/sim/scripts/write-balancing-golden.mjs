import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildBalancingSnapshot } from "../src/balancing-snapshot.ts";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "src", "snapshots");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "balancing.golden.json");
writeFileSync(outPath, `${JSON.stringify(buildBalancingSnapshot(), null, 2)}\n`);
console.log(`wrote ${outPath}`);
