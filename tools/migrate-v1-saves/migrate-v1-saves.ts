#!/usr/bin/env node
/**
 * Convert v1 save JSON files into v2 SaveEnvelope JSON.
 *
 * Usage (Node ≥ 22.6):
 *   node --experimental-strip-types tools/migrate-v1-saves/migrate-v1-saves.ts \
 *     --source path/to/v1.json --out path/to/v2.json [--vault vault.json] [--apply]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { importV1Save } from "../../packages/protocol/src/v1-import.ts";

function parseArgs(argv: string[]) {
  const args = {
    source: null as string | null,
    out: null as string | null,
    apply: false,
    vault: null as string | null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--source") {
      args.source = argv[i + 1] ?? null;
      i += 1;
    } else if (arg === "--out") {
      args.out = argv[i + 1] ?? null;
      i += 1;
    } else if (arg === "--vault") {
      args.vault = argv[i + 1] ?? null;
      i += 1;
    } else if (arg === "--apply") {
      args.apply = true;
    } else if (arg === "--dry-run") {
      args.apply = false;
    }
  }
  return args;
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  if (!args.source || !args.out) {
    console.error(
      "Usage: node --experimental-strip-types tools/migrate-v1-saves/migrate-v1-saves.ts --source <v1.json> --out <v2.json> [--vault vault.json] [--apply]",
    );
    process.exitCode = 1;
    return;
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(resolve(args.source), "utf8")) as unknown;
  } catch {
    console.error("invalid JSON in source file");
    process.exitCode = 1;
    return;
  }

  let accountVault: unknown;
  if (args.vault) {
    try {
      accountVault = JSON.parse(
        readFileSync(resolve(args.vault), "utf8"),
      ) as unknown;
    } catch {
      console.error("invalid JSON in vault file");
      process.exitCode = 1;
      return;
    }
  }

  const result = importV1Save(raw, { accountVault });
  if (!result.ok) {
    console.error(`import failed: ${result.error}`);
    process.exitCode = 1;
    return;
  }

  const envelope = result.value;
  const payload = envelope.payload;
  const heroName =
    typeof payload === "object" &&
    payload !== null &&
    "hero" in payload &&
    typeof (payload as { hero?: { name?: unknown } }).hero?.name === "string"
      ? (payload as { hero: { name: string } }).hero.name
      : "";
  const particles =
    typeof payload === "object" &&
    payload !== null &&
    "resources" in payload &&
    typeof (payload as { resources?: { particles?: unknown } }).resources
      ?.particles === "string"
      ? (payload as { resources: { particles: string } }).resources.particles
      : "0";

  console.log(
    JSON.stringify(
      {
        ok: true,
        schemaVersion: envelope.schemaVersion,
        savedAt: envelope.savedAt,
        hero: heroName,
        particles,
        apply: args.apply,
        out: resolve(args.out),
      },
      null,
      2,
    ),
  );

  if (args.apply) {
    writeFileSync(
      resolve(args.out),
      `${JSON.stringify(envelope, null, 2)}\n`,
      "utf8",
    );
    console.log(`wrote ${resolve(args.out)}`);
  } else {
    console.log("dry-run only — pass --apply to write the envelope");
  }
}

main();
