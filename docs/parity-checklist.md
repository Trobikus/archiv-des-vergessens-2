# Feature parity checklist (from v1)

Generated from `archiv-des-vergessens-1` services + Preact UI. Check items when v2 reaches equivalent behavior.

Legend: `[ ]` pending · `[x]` done · `n/a` intentionally dropped

## Core infrastructure

| Item | v1 source | Phase | Status |
|---|---|---|---|
| DI container | `js/core/di/*` | 1 | [x] |
| Event bus | `js/core/events/*` | 1 | [x] |
| State manager | `js/core/state/*` | 1–2 | [x] Store + Phase-2 GameState |
| Logger | `js/core/logger.js` | 0 | [x] |
| Game loop / ticker | `js/core/game/loop.js` | 1–2 | [x] Ticker + GameSession Loop |
| Math / balancing | `js/core/game/math.js` | 1 | [x] + golden snapshot gate |
| Save manager | `js/core/persistence/save-manager.js` | 2 | [x] SaveStore (IndexedDB cache) |
| Cloud manager | `js/core/persistence/cloud-manager.js` | 4 | [x] CloudSyncService |
| Settings | `js/core/settings.js` | 6F | [x] OptionsView (locale/audio/particles/floatingText/autosave/account/reset) |
| Security helpers | `js/core/security.js` | 4 | [x] PBKDF2 + sanitize server-side |
| Object pool | `js/core/pool.js` | 8 | [ ] |

## Services

| Service | Phase | Status |
|---|---|---|
| resource-service | 2 | [x] |
| idle-service | 2 | [x] GedankenArchiv Slice |
| offline-progress-service | 2 / 7 | [x] Idle-Offline + Clan-Produktion offline |
| hero-service | 3 | [x] create/exp/stats/equip |
| i18n-service | 3 | [x] DE/EN + key-gate |
| story-service | 3 | [x] fight/spells/intro slice |
| story-branch-service | 6D | [x] |
| quest-service | 6A | [x] |
| achievement-service | 6A | [x] |
| daily-reward-service | 6A | [x] |
| forge-service | 6B | [x] craft/upgrade/salvage |
| crafting-service | 6B | [x] |
| gather-service | 2 / 6B | [x] Click/Upgrade + library gather_boost |
| talent-service | 6C | [x] |
| challenge-service | 6C | [x] |
| library-service | 6C | [x] |
| codex-service | 6D | [x] |
| relic-hunt-service | 6E | [x] |
| account-vault-service | 6E | [x] |
| combat-analytics-service | 6E | [x] |
| tutorial-service | 6F | [x] |
| auth-service | 4 | [x] |
| network-service | 4 | [x] WsClient |
| chat-service | 7 | [x] |
| friend-service | 7 | [x] local sim |
| clan-service | 7 | [x] local idle / raid / expedition |
| leaderboard-service | 7 | [x] personal + global WS |

## UI modules

| Module | Phase | Status |
|---|---|---|
| Boot shell (“Boot OK”) | 0 | [x] |
| views/LoginView | 4 | [x] |
| views/CharacterSelectView | 3 | [x] |
| views/IntroView | 6F | [x] |
| views/MenuView | 6F | [x] |
| views/OptionsView | 6F | [x] locale/audio/particles/floatingText/autosave/account/reset |
| views/GameView | 2–3 / 6 | [x] Idle + Hub-Tabs (A–F panels) |
| views/HubView + hub/* | 6 | [x] Hub-Tabs in GameView (scrollable) |
| views/MainApp | 2 | [x] App boot + GameView |
| hero/* | 3 | [x] HeroPanel (slim) |
| combat/* | 3 / 6E | [x] FloatingDamage + CombatAnalyticsPanel |
| quest/QuestUI | 6A | [x] QuestPanel |
| achievement/AchievementUI | 6A | [x] AchievementPanel + daily claim |
| challenges/ChallengeUI | 6C | [x] ChallengePanel |
| forge/ForgeUI | 6B | [x] ForgePanel |
| crafting/CraftingUI | 6B | [x] CraftingPanel |
| library/LibraryUI | 6C | [x] LibraryPanel |
| skilltree/SkillTreeModal | 6C | [x] SkillTreePanel |
| story/* + dialog/DialogUI | 3 / 6D | [x] StoryPanel + StoryBranchPanel + DialogPanel |
| codex/CodexUI | 6D | [x] CodexPanel |
| relic/RelicHuntUI | 6E | [x] RelicHuntPanel |
| tutorial/TutorialUI | 6F | [x] |
| account/* | 4 | [x] AccountBadge + convertGuest |
| chat/ChatUI | 7 | [x] ChatPanel |
| friends/FriendsUI | 7 | [x] FriendsPanel |
| clan/ClanUI | 7 | [x] ClanPanel (`#clan-recruit-panel`) |
| leaderboard/LeaderboardUI | 7 | [x] LeaderboardPanel |
| shared/* (modals, toasts, offline) | 2+ | [x] Offline-Report Banner (Phase 2) |
| vault/VaultUI | 6E | [x] VaultPanel |

## Explicitly dropped vs v1

| Item | Reason |
|---|---|
| htm templates | Replaced by Preact TSX |
| Tauri rusqlite game saves | IndexedDB cache + server authority |
| Rust `game_loop` | Sim/ticker in TypeScript |
| v1 cloud-save blobs | Breaking schema; accounts may migrate |
