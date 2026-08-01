/**
 * Static a11y-basis gate: ensures critical UI files keep landmark / label / alert patterns.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const checks = [
  {
    file: "apps/client/src/ui/auth/LoginView.tsx",
    patterns: [
      /role="main"/,
      /aria-label="Login-Portal"/,
      /role="alert"/,
      /data-testid="login-view"/,
    ],
  },
  {
    file: "apps/client/src/ui/IntroView.tsx",
    patterns: [/data-testid="intro-skip"/, /data-testid="intro-view"/],
  },
  {
    file: "apps/client/src/ui/combat/FloatingDamageOverlay.tsx",
    patterns: [/aria-hidden="true"/, /data-testid="floating-damage"/],
  },
];

let failed = false;

for (const check of checks) {
  const path = join(root, check.file);
  const source = readFileSync(path, "utf8");
  for (const pattern of check.patterns) {
    if (!pattern.test(source)) {
      console.error(`a11y-basis: ${check.file} missing ${String(pattern)}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("a11y-basis: OK");
