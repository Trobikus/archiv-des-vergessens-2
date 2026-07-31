# Feature parity checklist (from v1)

Generated from `archiv-des-vergessens-1` services + Preact UI. Check items when v2 reaches equivalent behavior.

Legend: `[ ]` pending · `[x]` done · `n/a` intentionally dropped

## Core infrastructure

| Item | v1 source | Phase | Status |
|---|---|---|---|
| DI container | `js/core/di/*` | 1 | [ ] |
| Event bus | `js/core/events/*` | 1 | [ ] |
| State manager | `js/core/state/*` | 1–2 | [ ] |
| Logger | `js/core/logger.js` | 0 | [x] stub |
| Game loop / ticker | `js/core/game/loop.js` | 1–2 | [ ] |
| Math / balancing | `js/core/game/math.js` | 1 | [ ] |
| Save manager | `js/core/persistence/save-manager.js` | 2 | [ ] |
| Cloud manager | `js/core/persistence/cloud-manager.js` | 4 | [ ] |
| Settings | `js/core/settings.js` | 6F | [ ] |
| Security helpers | `js/core/security.js` | 4 | [ ] |
| Object pool | `js/core/pool.js` | 8 | [ ] |

## Services

| Service | Phase | Status |
|---|---|---|
| resource-service | 2 | [ ] |
| idle-service | 2 | [ ] |
| offline-progress-service | 2 | [ ] |
| hero-service | 3 | [ ] |
| i18n-service | 3 | [ ] |
| story-service | 3 | [ ] |
| story-branch-service | 6D | [ ] |
| quest-service | 6A | [ ] |
| achievement-service | 6A | [ ] |
| daily-reward-service | 6A | [ ] |
| forge-service | 6B | [ ] |
| crafting-service | 6B | [ ] |
| gather-service | 6B | [ ] |
| talent-service | 6C | [ ] |
| challenge-service | 6C | [ ] |
| library-service | 6C | [ ] |
| codex-service | 6D | [ ] |
| relic-hunt-service | 6E | [ ] |
| account-vault-service | 6E | [ ] |
| combat-analytics-service | 6E | [ ] |
| tutorial-service | 6F | [ ] |
| auth-service | 4 | [ ] |
| network-service | 4 | [ ] |
| chat-service | 7 | [ ] |
| friend-service | 7 | [ ] |
| clan-service | 7 | [ ] |
| leaderboard-service | 7 | [ ] |

## UI modules

| Module | Phase | Status |
|---|---|---|
| Boot shell (“Boot OK”) | 0 | [x] |
| views/LoginView | 4 | [ ] |
| views/CharacterSelectView | 3 | [ ] |
| views/IntroView | 6F | [ ] |
| views/GameView | 2–3 | [ ] |
| views/HubView + hub/* | 6 | [ ] |
| views/MainApp | 2 | [ ] |
| views/OptionsView | 6F | [ ] |
| hero/* | 3 | [ ] |
| combat/* | 3 / 6E | [ ] |
| quest/QuestUI | 6A | [ ] |
| achievement/AchievementUI | 6A | [ ] |
| challenges/ChallengeUI | 6C | [ ] |
| forge/ForgeUI | 6B | [ ] |
| crafting/CraftingUI | 6B | [ ] |
| library/LibraryUI | 6C | [ ] |
| skilltree/SkillTreeModal | 6C | [ ] |
| story/* + dialog/DialogUI | 3 / 6D | [ ] |
| codex/CodexUI | 6D | [ ] |
| relic/RelicHuntUI | 6E | [ ] |
| tutorial/TutorialUI | 6F | [ ] |
| account/* | 4 | [ ] |
| chat/ChatUI | 7 | [ ] |
| friends/FriendsUI | 7 | [ ] |
| clan/ClanUI | 7 | [ ] |
| leaderboard/LeaderboardUI | 7 | [ ] |
| shared/* (modals, toasts, offline) | 2+ | [ ] |

## Explicitly dropped vs v1

| Item | Reason |
|---|---|
| htm templates | Replaced by Preact TSX |
| Tauri rusqlite game saves | IndexedDB cache + server authority |
| Rust `game_loop` | Sim/ticker in TypeScript |
| v1 cloud-save blobs | Breaking schema; accounts may migrate |
