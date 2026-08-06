# Core vs deferred — Archiv des Vergessens (Alpha)

Canonical allow/deny list for the **content-police** skill.  
Genre: Idle-/Progression-RPG. Goal: one solid loop before width.

## ALLOW — Genre-Kern

Must become fully playable before expanding width:

| Area | In | Out (even if adjacent) |
|---|---|---|
| Idle | Click/tick, gather upgrades, offline production, autosave | Secondary sinks, event currencies |
| Held / Combat | Stats, basic equip, skilltree **as it feeds combat**, combat loop, rewards | Deep analytics, cosmetic-only trees without combat use |
| Story / Missions | Intro, tutorial, short story fights, quests that feed Idle/Combat | Branching epic content dumps, side activity boards |
| Persistenz | Local save envelope, optional auth + cloud envelope | Second DB, Tauri save DB, ad-hoc schemas |
| Hub | Navigation + chrome needed to reach Idle / Held / Story-Mission | New top-level categories; trophy walls |
| i18n | DE+EN for ALLOW surfaces | Locale sprawl for deferred panels |

## DENY — deferred until core is solid

Bugfix only (crash / data loss / security). No new depth:

| Area | Examples |
|---|---|
| Live social | Chat, friends, guild, guild chat, leaderboard |
| Clan meta | Recruit economy, raid, expedition (beyond harmless stub) |
| Workshop depth | Crafting trees, forge systems, library sinks |
| Collection meta | Relic hunt, challenges, vault, dailies |
| Distribution-as-content | Launcher features sold as gameplay; desktop polish as content milestone |
| Parity pressure | „v1 had it“ / Phase-6/7 completeness as Alpha justification |

## Decision shortcuts

| Request smells like… | Verdict |
|---|---|
| Faster Mneme / clearer upgrade / offline report | ALLOW |
| Combat reward missing / hero stuck | ALLOW |
| Quest that teaches the loop | ALLOW |
| Chat emoji / friend request UX | DENY |
| Guild ranks / leaderboard seasons | DENY |
| New crafting recipe pack | DENY |
| Clan raid balance pass | DENY (unless crash) |
| „Make Social tab impressive“ | DENY |
| Explicit override sentence from human | ALLOW under override — still smallest diff |

## Explicit non-goals for Alpha marketing

Do not describe DENY systems as Alpha pillars in README, site, or patch notes.  
Core pitch: **Atmosphäre · Idle-Fortschritt · Held/Kampf · kurze Story · Save**.
