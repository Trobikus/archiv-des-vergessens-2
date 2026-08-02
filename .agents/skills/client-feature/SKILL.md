---
name: client-feature
description: Implements or extends Preact client features (services, hub panels, game session wiring) in apps/client while matching existing create*Service and UI patterns. Use when editing client gameplay UI or services.
paths:
  - "apps/client/**"
---

# Skill: Client feature

## Read first

| Need | Path |
|---|---|
| Session wiring | `apps/client/src/services/game-session.ts` |
| Runtime state | `apps/client/src/state/game-state.ts` |
| Hub shell | `apps/client/src/ui/GameView.tsx` |
| Store hook | `apps/client/src/ui/useStore.ts` |
| Neighbor service | `apps/client/src/services/<domain>-service.ts` |
| Neighbor UI | `apps/client/src/ui/<domain>/` |

## Patterns to clone

### Service

```ts
export function createFooService(deps: FooDeps): FooService {
  return {
    doThing() {
      deps.store.setState((prev) => ({ ...prev, /* patch */ }));
    },
  };
}
```

- Wire into `createGameSession` the same way peers are wired
- Persist only through existing save mapping (game-state ↔ save payload) — do not invent a second save path

### UI

- Screens: `*View.tsx`; feature blocks: `*Panel.tsx` under `ui/<feature>/`
- Use Preact hooks from `preact/hooks`
- Use `class="..."` with existing BEM-ish tokens (`game__*`, `panel`, `glass-panel`, `shell-frame`, …)
- Wrap controls needing explanation in `Tip` with i18n keys
- Prefer `data-testid` where siblings already have them

### Hub placement

Only these top categories: `archiv`, `hero`, `story`, `missions`, `workshop`, `collection`, `social`.  
Add sub-nav items beside existing ones; do not invent an 8th top category unless explicitly requested.

## Do not

- Import server internals
- Use React APIs / htm
- Introduce Redux/Zustand/signals libraries
- Put formulas that belong in `@adv/sim` into UI components

## Verify

```bash
npx vitest run apps/client/src/services/<relevant>.test.ts
npm run typecheck
npm run lint
```
