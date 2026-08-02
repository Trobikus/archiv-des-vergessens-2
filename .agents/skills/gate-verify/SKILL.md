---
name: gate-verify
description: Runs and interprets npm run gate and individual quality gates (balancing, i18n, version parity, a11y, perf, typecheck, lint, coverage, build, clippy, e2e). Use before release, after risky edits, or when CI fails.
---

# Skill: Gate verify

## Full gate

```bash
npm run gate
```

Order (`tools/gates/gate.mjs`):

1. balancing-snapshot
2. i18n-keys
3. version-parity
4. a11y-basis
5. perf-budgets
6. typecheck
7. lint (`--max-warnings=0`)
8. test:coverage
9. build (client)
10. clippy (if cargo present; skip with `SKIP_CLIPPY=1`)
11. e2e (if Playwright chromium installed; skip with `SKIP_E2E=1`)

## Targeted shortcuts

| Area | Command |
|---|---|
| Balancing | `node tools/gates/balancing-snapshot.mjs` |
| i18n | `node tools/gates/i18n-keys.mjs` |
| Versions | `node tools/gates/version-parity.mjs` |
| Types | `npm run typecheck` |
| Lint | `npm run lint` |
| Unit tests | `npx vitest run <path>` |
| Coverage | `npm run test:coverage` |

## Failure handling

1. Read the first failing step — fix that root cause
2. Do not weaken thresholds, delete golden snapshots, or skip gates to “get green” unless the user explicitly orders a temporary skip
3. Version mismatch → update all lockstep locations together
4. i18n fail → add missing key on the other locale
5. Balancing fail → restore parity or explicitly refresh golden **with Freigabe**

## Alpha release stance

For official test-alpha candidates: full `npm run gate` must be green before tagging/pushing `v*.*.*`.
