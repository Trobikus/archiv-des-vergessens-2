---
trigger: always_on
description: Existing code patterns — Preact, services, WS events, i18n, UI chrome
---

# Code patterns (match existing code)

## Client

- Entry: `apps/client/src/main.tsx` → `ui/App.tsx` → `createGameSession`
- Services: `apps/client/src/services/*-service.ts` exporting `createFooService(...)`
- State: `@adv/core` `Store` + `ui/useStore.ts` — no Redux/Zustand
- Resources: `bigint` where existing code uses bigint
- DOM classes: `class="..."` (Preact), not React `className` on elements
- Hub categories (fixed): `archiv` · `hero` · `story` · `missions` · `workshop` · `collection` · `social`
- Tooltips: prefer `ui/Tip.tsx` + i18n keys; tip keys gated by `ui/tip-i18n.test.ts`
- Visual system: Abyss & Gold CSS vars in `styles/variables.css` — extend, don’t invent a new theme

## Protocol / WS

- Event names via `WS_EVENTS` in `packages/protocol/src/events.ts` (`domain:action[:success|error]`)
- Wire: `{ type, payload }` + `validateWsMessage` then module handlers
- Validators return `ValidationResult<T>` — never introduce zod/yup/io-ts

## i18n

- Add the **same** key to `packages/content/src/i18n/de.ts` **and** `en.ts`
- Use `session.i18n.translate("key")` / `t(locale, key)`
- Key parity is gated (`npm run gate` → i18n-keys)

## Balancing

- `packages/sim` numbers must stay v1-parity unless the user **explicitly** approves a change
- Any CONFIG/math change requires updating `balancing.golden.json` and green balancing gate
