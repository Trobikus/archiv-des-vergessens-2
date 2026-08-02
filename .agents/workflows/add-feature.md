---
description: Add a small feature using existing architecture — no greenfield redesign
---

When the user runs `/add-feature <request>`:

1. Load `safe-change`. Restate scope; list out-of-scope items.
2. Inspect the closest existing feature (service + UI + tests + i18n).
3. If the request needs new WS events or save fields, also load `protocol-ws` / `save-envelope` and confirm the approach with the user before large edits.
4. Implement by cloning patterns:
   - Client → `client-feature` (+ `ui-hub` / `i18n-content` as needed)
   - Server → `server-module`
   - Sim numbers → stop unless Freigabe; use `sim-balancing`
5. Keep package boundaries and hub categories unchanged.
6. Verify with targeted tests; run `npm run gate` for cross-cutting work.
7. Report what was added and how it mirrors existing structure.
