/**
 * Ensures release surface versions stay in lockstep with the root package.json.
 * Display version in the client is injected from that root version at Vite build time.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readJson(relPath) {
  return JSON.parse(readFileSync(join(root, relPath), "utf8"));
}

function readTomlVersion(relPath) {
  const text = readFileSync(join(root, relPath), "utf8");
  const match = text.match(/^version\s*=\s*"([^"]+)"/m);
  if (!match) {
    throw new Error(`No package version in ${relPath}`);
  }
  return match[1];
}

const rootVersion = readJson("package.json").version;
if (typeof rootVersion !== "string" || rootVersion.length === 0) {
  throw new Error("Root package.json is missing version");
}

const checks = [
  ["apps/desktop/package.json", readJson("apps/desktop/package.json").version],
  [
    "apps/desktop/src-tauri/tauri.conf.json",
    readJson("apps/desktop/src-tauri/tauri.conf.json").version,
  ],
  [
    "apps/desktop/src-tauri/Cargo.toml",
    readTomlVersion("apps/desktop/src-tauri/Cargo.toml"),
  ],
  ["apps/launcher/package.json", readJson("apps/launcher/package.json").version],
  [
    "apps/launcher/src-tauri/tauri.conf.json",
    readJson("apps/launcher/src-tauri/tauri.conf.json").version,
  ],
  [
    "apps/launcher/src-tauri/Cargo.toml",
    readTomlVersion("apps/launcher/src-tauri/Cargo.toml"),
  ],
];

const mismatches = checks.filter(([, version]) => version !== rootVersion);
if (mismatches.length > 0) {
  console.error(`version-parity: root is ${rootVersion}`);
  for (const [path, version] of mismatches) {
    console.error(`  ${path} => ${version}`);
  }
  process.exit(1);
}

console.log(`version-parity: OK (${rootVersion})`);
