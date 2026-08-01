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

/** True when this module is the process entrypoint (not imported by tests). */
export function isExecutedDirectly(
  entryPath: string | undefined = process.argv[1],
  moduleUrl: string = import.meta.url,
): boolean {
  if (entryPath === undefined) {
    return false;
  }
  return moduleUrl === pathToFileURL(entryPath).href;
}

if (isExecutedDirectly()) {
  main();
}
