---
name: ui-hub
description: Edits cinematic hub chrome, panels, tooltips, scenes, and Abyss & Gold CSS without inventing a new design system. Use for hub layout, Tip bubbles, glass/shell styling, or scene art wiring.
paths:
  - "apps/client/src/ui/**"
  - "apps/client/src/styles/**"
  - "apps/client/public/scenes/**"
  - "design/**"
---

# Skill: UI hub / chrome

## Read first

- `apps/client/src/ui/GameView.tsx`
- `apps/client/src/ui/Tip.tsx`
- `apps/client/src/styles/variables.css`
- `apps/client/src/styles/hub.css`
- `apps/client/src/styles/game-shell.css`
- `apps/client/src/styles.css` (import list)
- Design refs under `design/` when pixel-matching

## Visual rules (existing system)

- Palette/tokens already defined — extend CSS variables, don’t introduce a second theme
- Fonts: header Cinzel, body Inter (already in variables) — do not switch stacks casually
- Prefer `shell-frame`, `glass-panel`, `glass-btn`, `glow-text`, `text-gold`, rails/footer classes already used
- Hub is cinematic chrome pixel-matched to mocks — avoid generic “card dashboard” layouts
- Scenes: wire through existing `SCENE_BY_CATEGORY` / `public/scenes/` patterns

## Tooltips

```tsx
<Tip title={t("…")} text={t("…Tip")} below>
  <button type="button" class="game__btn">…</button>
</Tip>
```

- Add matching DE/EN keys
- Keep `tip-i18n.test.ts` green if tip titles are localized

## Accessibility

- Preserve existing focus/hover tip behavior (`:focus-within`)
- Don’t remove `type="button"` / labels / testids that gates or tests rely on
- Check `tools/gates/a11y-basis.mjs` patterns if touching Login/Intro/FloatingDamage

## Verify

```bash
npm run lint
npx vitest run apps/client/src/ui/tip-i18n.test.ts
npm run build
```
