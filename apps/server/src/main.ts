import { pathToFileURL } from "node:url";

import { createLogger } from "@adv/core";
import { SAVE_SCHEMA_VERSION } from "@adv/protocol";

const log = createLogger("server");

export function bootBanner(): string {
  return `Boot OK (save schema v${String(SAVE_SCHEMA_VERSION)})`;
}

export function main(): void {
  log.info(bootBanner());
}

function isExecutedDirectly(): boolean {
  const entry = process.argv[1];
  if (entry === undefined) {
    return false;
  }
  return import.meta.url === pathToFileURL(entry).href;
}

if (isExecutedDirectly()) {
  main();
}
