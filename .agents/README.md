# Antigravity agents — Archiv des Vergessens

Rule- und Skill-Set für **Google Antigravity** mit **Gemini 3.1 Pro**, damit Agent-Arbeit die bestehende v2-Architektur nicht verfälscht — besonders kritisch kurz vor der offiziellen Test-Alpha.

## Layout

```text
.agents/
├─ agents.md                 # Personas (@engineer, @backend, @client, @qa, @sim)
├─ rules/                    # Always-on / decision rules (kurz halten — Cap ~12k)
├─ skills/*/SKILL.md         # Domain-Skills (progressive disclosure)
└─ workflows/*.md            # Slash-Commands: /safe-fix, /add-feature, /pre-release-check
```

## Nutzung in Antigravity

1. Workspace = Repo-Root öffnen.
2. Modell: **Gemini 3.1 Pro** (oder aktuelles Gemini-3.1-Pro-Label in Antigravity).
3. Rules unter `.agents/rules/` werden als persistenter Kontext geladen.
4. Skills greifen über ihre `description` automatisch — oder per ausdrücklicher Erwähnung (z. B. „nutze safe-change“).
5. Workflows: im Agent-Chat `/` → `safe-fix` / `add-feature` / `pre-release-check`.

## Empfohlene Default-Haltung

- Vor jedem Code-Edit implizit **safe-change**.
- Bei Spieler-Bugs **alpha-bugfix**.
- Vor Tag/Release **`/pre-release-check`**.

## Was dieses Set verhindert

- Erfundene APIs / zweite Persistenz / zod / React-Patterns
- Falsche Package-Imports (`@adv/server` → sim/content)
- Clan↔Guild-Verwechslung
- Balancing-Drift ohne Freigabe
- Feature-Branches trotz main-only
- Hub-/Logo-Wildwuchs

## Pflege

- Rules kurz und stabil halten (Always-on-Budget).
- Neue Domänenwissen → neuer Skill-Ordner mit `SKILL.md`, nicht die Always-on-Rules aufblasen.
- Bei Architektur-ADR-Änderungen zuerst `rules/01-architecture.md` und betroffene Skills syncen.
