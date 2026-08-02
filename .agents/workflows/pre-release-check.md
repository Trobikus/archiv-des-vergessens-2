---
description: Pre-flight checklist before official test-alpha tag or release build
---

When the user runs `/pre-release-check`:

1. Load `gate-verify` and act as **QA / Gatekeeper**.
2. Confirm branch is `main` and working tree intent is clear.
3. Run `npm run gate` (do not skip clippy/e2e unless user sets `SKIP_CLIPPY=1` / `SKIP_E2E=1` knowingly).
4. Sanity-check release-risk invariants (read-only unless asked to fix):
   - Version lockstep (root / desktop / launcher / tauri / Cargo)
   - No cheat APIs on release paths
   - Live WSS default for release clients
   - i18n DE/EN parity
   - Balancing golden snapshot
   - Save `schemaVersion` still coherent with migrations
5. If anything fails: fix only with `alpha-bugfix` / domain skills, re-run gate.
6. Output a short go/no-go summary for test-alpha.
