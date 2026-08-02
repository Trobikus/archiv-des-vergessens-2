/**
 * Shared risk classification for ADV agent hooks.
 * Keep patterns strict — false positives are preferable to silent damage.
 */

export const HIGH_RISK_REGEXES = [
  /(?:^|\/)packages\/sim(?:\/|$)/,
  /(?:^|\/)packages\/protocol(?:\/|$)/,
  /(?:^|\/)apps\/server(?:\/|$)/,
  /balancing\.golden\.json$/,
  /(?:^|\/)tools\/migrate-/,
  /(?:^|\/)docs\/adr(?:\/|$)/,
  /schemaVersion/,
  /(?:^|\/)apps\/(?:desktop|launcher)\/src-tauri(?:\/|$)/,
  /(?:^|\/)apps\/client\/src\/services\/(?:game-session|save-|cloud-|auth-)/,
  /(?:^|\/)apps\/client\/src\/state\/game-state/,
  /(?:^|\/)apps\/server\/src\/(?:db\/schema|crypto\/password)/,
];

/** Path substrings that often mean save/codec/migration work */
export const HIGH_RISK_NAME_HINTS = [
  "/save",
  "save-store",
  "saveStore",
  "/codec",
  "migrate",
  "migration",
  "pbkdf",
  "cloud-envelope",
  "cloudEnvelope",
  "ws-message",
  "save-envelope",
  "save-payload",
];

export function normalizePath(filePath) {
  return String(filePath || "").replace(/\\/g, "/");
}

export function isHighRiskPath(filePath) {
  const p = normalizePath(filePath);
  if (!p) return false;
  if (HIGH_RISK_REGEXES.some((re) => re.test(p))) return true;
  const lower = p.toLowerCase();
  return HIGH_RISK_NAME_HINTS.some((hint) => lower.includes(hint.toLowerCase()));
}

export const RISK_LATEST_FILE = "/tmp/adv-agent-risk-latest.json";

export function riskSessionFile(conversationId) {
  const id = String(conversationId || "unknown").replace(/[^\w.-]/g, "_");
  return `/tmp/adv-agent-risk-${id}.json`;
}

export function readJsonStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.on("data", (c) => chunks.push(c));
    process.stdin.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    process.stdin.on("error", reject);
  });
}

export function writeJson(obj) {
  process.stdout.write(`${JSON.stringify(obj)}\n`);
}
