# Cursor project config — Archiv des Vergessens

SAFE MODE for Cursor agents near **test alpha**. Complements shared `.agents/` skills (Cursor loads those automatically). See root `AGENTS.md`.

## Layout

```text
.cursor/
├─ rules/*.mdc     # alwaysApply + glob-scoped
├─ skills/*/       # safe-ui-patch, hard-stop-architecture, pre-done-gate
├─ hooks.json
└─ hooks/*.mjs     # session, shell guard, risk record, stop gate
```

## Hooks (model cannot ignore)

| Event | Effect |
|---|---|
| `sessionStart` | Inject SAFE MODE constitution |
| `beforeShellExecution` (`failClosed`) | Block branch creation, force-push, hard-reset, gate-skip, core `rm -rf`, npm publish |
| `afterFileEdit` | Record high-risk path edits |
| `postToolUse` | Inject reminders on high-risk edits |
| `stop` | One follow-up requiring full `npm run gate` + scope audit |

## Rules

Always-on: `scope-lock`, `package-boundaries`, `main-only`, `studio-logo`  
Glob: `client-preact`, `protocol-server`, `sim-balancing`, `i18n-content`, `site-studio`

## Git hooks

`.githooks/pre-commit` · `.githooks/pre-push` (`prepare` → `core.hooksPath=.githooks`)
