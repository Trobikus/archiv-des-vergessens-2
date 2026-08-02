---
name: i18n-content
description: Adds or edits DE/EN i18n keys and typed content records in @adv/content. Use when changing player-facing text, tooltips, quests, items, talents, dialogs, or content data modules.
paths:
  - "packages/content/**"
  - "apps/client/src/ui/**"
---

# Skill: i18n & content

## Read first

- `packages/content/src/i18n/de.ts`
- `packages/content/src/i18n/en.ts`
- `packages/content/src/i18n/translate.ts`
- Domain module e.g. `quests.ts`, `items.ts`, `talent-nodes.ts`, …
- Client usage: `session.i18n.translate("…")`
- Tip key gate: `apps/client/src/ui/tip-i18n.test.ts` (when touching tips)

## Adding UI copy

1. Choose a key matching existing prefixes (`hub.*`, `hero.*`, `archiv.*`, `auth.*`, `quests.*`, `clan.*`, `common.*`, …)
2. Add the key to **both** `de.ts` and `en.ts` in the same commit
3. Use the typed key via translate helpers — do not hardcode German/English strings in TSX for player-facing text when peers use i18n
4. Run i18n parity gate

## Adding content records

- Follow typed shapes in `packages/content/src/types.ts` and neighboring modules
- Content package stays I/O-free and must not import other `@adv/*` packages
- Keep IDs stable; do not renumber/rename content IDs used in saves without migration plan

## Verify

```bash
node tools/gates/i18n-keys.mjs
npx vitest run packages/content
# if tips changed:
npx vitest run apps/client/src/ui/tip-i18n.test.ts
```
