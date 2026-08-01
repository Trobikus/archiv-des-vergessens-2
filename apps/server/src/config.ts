import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export type ServerConfig = {
  readonly port: number;
  readonly dataDir: string;
  readonly dbFile: string;
  readonly allowedOrigins: readonly string[];
  readonly trustProxy: boolean;
  readonly cloudVersion: string;
};

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "tauri://localhost",
] as const;

export function loadConfig(
  env: NodeJS.ProcessEnv = process.env,
): ServerConfig {
  const dataDir = env["DATA_DIR"]
    ? resolve(env["DATA_DIR"])
    : join(__dirname, "..", "data");
  mkdirSync(dataDir, { recursive: true });

  const originsRaw = env["ALLOWED_ORIGINS"];
  const allowedOrigins =
    originsRaw !== undefined && originsRaw.length > 0
      ? originsRaw.split(",").map((part) => part.trim())
      : [...DEFAULT_ORIGINS];

  const portRaw = env["PORT"];
  const port =
    portRaw !== undefined && portRaw.length > 0 ? Number(portRaw) : 8080;

  return {
    port: Number.isFinite(port) && port > 0 ? port : 8080,
    dataDir,
    dbFile: join(dataDir, "database.db"),
    allowedOrigins,
    trustProxy: env["TRUST_PROXY"] === "true",
    cloudVersion: env["CLOUD_SAVE_VERSION"] ?? "2.0.0-phase5",
  };
}
