---
description: Fix a bug safely for test-alpha — triage, minimal patch, verify gates
---

When the user runs `/safe-fix` (optionally with a bug description):

1. Act as **QA / Lead Engineer**. Load skills `alpha-bugfix` and `safe-change`.
2. Reproduce or encode the bug in a failing test when practical.
3. Read the owning existing files only; identify root cause.
4. Apply the smallest patch that matches neighboring patterns.
5. Run targeted vitest + `npm run typecheck` + `npm run lint`.
6. If the fix touches save, auth, protocol, sim, i18n, or hub chrome, run `npm run gate` (skill `gate-verify`).
7. Summarize root cause, files changed, and verification. Do not refactor unrelated code.
