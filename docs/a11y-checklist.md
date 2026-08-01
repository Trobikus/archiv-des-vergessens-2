# Accessibility basis (Phase 8)

Minimum a11y bar for Archiv des Vergessens v2. Gate: `tools/gates/a11y-basis.mjs` + Playwright smoke.

## Required patterns

| Surface | Requirement | Status |
|---|---|---|
| Login | `role="main"` + `aria-label`; form fields wrapped in `<label>`; errors `role="alert"` | [x] |
| Intro skip | Focusable button with visible text / `data-testid` | [x] |
| Decorative FX | Canvas / rune marks / floaters `aria-hidden="true"` | [x] |
| Pause / menus | Dialog chrome uses buttons (keyboard activatable) | [x] |
| Combat floaters | `aria-hidden="true"` (non-essential) | [x] |
| Auth banners | Success/error announced via `role="alert"` on errors | [x] |

## Manual checks (playtest)

- [ ] Tab order reaches username → password → submit without traps
- [ ] ESC opens pause / closes modal (desktop feel)
- [ ] Contrast of gold-on-dark text remains readable at 100% zoom
- [ ] Screen-reader: login main landmark announces “Login-Portal”

## Out of scope (post-2.0.0)

- Full WCAG 2.2 AA audit
- Virtualized lists for every hub panel
- Reduced-motion preference wiring beyond particle toggle
