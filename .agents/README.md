# Agents — Archiv des Vergessens

Shared **skills** + Antigravity **rules/workflows** for safe work near official test alpha (`0.3.0-alpha`).

Cursor also loads skills from this folder. Cursor-specific rules/hooks/skills live in `.cursor/`. Cross-tool constitution: root `AGENTS.md`.

## Layout

```text
.agents/
├─ agents.md                 # Personas
├─ rules/                    # Antigravity always-on (~12k Cap)
├─ skills/*/SKILL.md         # Shared domain skills (Cursor + Antigravity)
└─ workflows/*.md            # Antigravity slash commands
```

## Skills (shared)

| Skill | When |
|---|---|
| `safe-change` | Any code change (default) |
| `alpha-bugfix` | Player-facing bugs |
| `client-feature` / `ui-hub` | Client services & hub UI |
| `protocol-ws` / `server-module` / `save-envelope` | Wire contract & server |
| `sim-balancing` | CONFIG/math (Freigabe!) |
| `i18n-content` | DE/EN + content data |
| `gate-verify` | CI / pre-release |

Several skills declare Cursor `paths:` globs.

## Antigravity

1. Workspace = Repo-Root · Modell **Gemini 3.1 Pro**
2. Rules: `.agents/rules/`
3. Workflows: `/safe-fix`, `/add-feature`, `/pre-release-check`

## Cursor (parallel, enforceable)

- Rules: `.cursor/rules/` (`scope-lock`, `package-boundaries`, glob rules, …)
- Skills: `.cursor/skills/` (`safe-ui-patch`, `hard-stop-architecture`, `pre-done-gate`) + this folder
- Hooks: `.cursor/hooks.json` (shell `failClosed`, high-risk edit audit, stop gate)
- Lite gate: `npm run gate:lite` (also on pre-push to `main`)

When changing policy: sync `.agents/rules` ↔ `.cursor/rules` + `AGENTS.md`.

## Pflege

- Keep always-on rules short; put procedures in skills.
- Do not weaken hooks/gates without explicit user order.
