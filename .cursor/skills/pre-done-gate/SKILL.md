---
name: pre-done-gate
description: >-
  Mandatory completion checklist before claiming a coding task is done.
  Use at the end of every implementation task, before commit/push.
---

# Skill: pre-done-gate (STRICT)

Do not say "done" until every box is honest.

## Checklist

- [ ] Diff matches the asked scope only (no drive-by files)
- [ ] No edits under high-risk paths unless the user named that area
- [ ] No balancing / golden snapshot edits to silence failures
- [ ] No invented APIs / second persistence / zod / React/htm
- [ ] i18n: DE **and** EN updated if user-facing strings changed
- [ ] Studio logo assets untouched unless branding was the task
- [ ] Social ownership respected (Clan local vs Guild/Friends live)
- [ ] Branch is `main` (repo policy) unless user explicitly ordered otherwise
- [ ] Checks run:
  - **Tiny UI/copy:** `npm run gate:lite` (or typecheck + i18n-keys + balancing-snapshot)
  - **Anything else / unsure / high-risk:** full `npm run gate`
- [ ] Commit message describes the actual effect (not "cleanup" / "fixes")

## If any box fails

Fix or stop. Do not push red. Do not widen scope to make green.
