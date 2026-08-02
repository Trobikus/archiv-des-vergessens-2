#!/usr/bin/env node
/**
 * sessionStart — inject strict safe-mode context (IDE sessions).
 * Note: may not run for cloud agents at true start; rules/AGENTS.md still apply.
 */
import { readJsonStdin, writeJson } from "./lib/risk.mjs";

await readJsonStdin();

writeJson({
  additional_context: [
    "ADV SAFE MODE (0.3.0-alpha — near official test alpha).",
    "Obey AGENTS.md, .cursor/rules/scope-lock.mdc, package-boundaries.mdc, main-only.mdc.",
    "Never invent APIs — mirror existing create*Service / WS_EVENTS / validators / hub patterns.",
    "Leaves: @adv/protocol|core|sim|content must not import other @adv/*. Server = core+protocol only.",
    "Clan = client-local; Friends/Guild/Chat/Leaderboard = live WS. No zod. Preact not React/htm.",
    "High-risk without explicit ask: packages/sim, packages/protocol, apps/server, saves/migrations, balancing.golden.json, Tauri beyond shell.",
    "Cursor skills: safe-ui-patch | hard-stop-architecture | pre-done-gate. Shared: .agents/skills (safe-change, domain skills).",
    "Tiny UI/copy → gate:lite. Non-trivial / high-risk → full npm run gate. Branch: main only.",
  ].join(" "),
});
process.exit(0);
