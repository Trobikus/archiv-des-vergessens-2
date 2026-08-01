# Save format

```ts
type SaveEnvelope = {
  schemaVersion: 1;
  savedAt: number;
  payload: Phase2SavePayload;
};

type Phase2SavePayload = {
  resources: {
    particles: string;
    totalParticles: string;
    mnemeFragmente: string;
    totalMnemeFragmente: string;
    ewigeMneme: string;
    relics: string;
    totalRelics: string;
    artifacts: string;
    memoryDust: string;
    catalyst: string;
  };
  idleGenerators: {
    gedankenArchiv: {
      level: number;
      baseCost: number;
      costMultiplier: number;
      baseYield: number;
      upgrades: { focusBonus: number };
    };
  };
  gather: { clickPowerLevel: number };
  hero: { /* see createDefaultHeroSave() */ };
  story: { storyFightsIntroSeen: boolean; selectedChapter: number };
  settings: {
    locale: "de" | "en";
    particlesEnabled: boolean;
    floatingTextEnabled: boolean;
    audioEnabled: boolean;
    autosaveMs: number;
  };
  quests: { mainIndex: number; daily: { /* daily quest counters */ } };
  achievements: { progress: Record<string, { progress: number; achieved: boolean; claimed: boolean }> };
  forge: { craftedCount: number };
  crafting: { level: number; exp: number; expToNext: number; unlockedRecipes: string[] };
  library: { upgrades: { gather_boost: number; clan_boost: number; forge_discount: number } };
  talents: { points: number; allocatedNodeIds: string[] };
  challenges: { active: string | null; completed: string[]; pacifistUnlocked: boolean; droughtBonus: boolean };
  codex: { unlockedIds: string[]; decryptedLoreIds: string[] };
  storyBranch: { currentNode: string | null; flags: Record<string, boolean | number | string>; visited: string[]; history: string[]; endingReached: string | null };
  relicHunt: { cooldownEnd: number };
  accountVault: { particles: string; relics: string; artifacts: string; memoryDust: string; items: ItemSave[] };
  tutorial: { step: number; finished: boolean };
  friends: { list: FriendEntrySave[]; pending: FriendRequestSave[]; sent: FriendRequestSave[] };
  clan: {
    members: ClanMemberSave[];
    nextId: number;
    expeditionStatus: Record<string, boolean>;
    raid: {
      active: boolean;
      members: number[];
      durationSeconds: number;
      maxDuration: number;
      lastRaidTime: number;
      rewardClaimed: boolean;
    };
  };
  leaderboard: {
    highestPrestige: number;
    totalPrestiges: number;
    totalBossesDefeated: number;
    highestChapterReached: number;
    highestLevel: number;
    highestCraftingLevel: number;
    totalMasterworksCrafted: number;
    highestItemQuality: number;
    peakParticlesPerSecond: number;
    peakRelicsPerSecond: number;
    totalParticlesCollected: number;
    totalRelicsCollected: number;
    achievementsUnlocked: number;
    totalExpeditions: number;
    successfulExpeditions: number;
    totalPlayTime: number;
    sessionCount: number;
    lastPlayed: number;
    fastestBossKill: number | null;
    fastestLevelUp: number | null;
    fastestPrestige: number | null;
  };
  meta: { lastActiveAt: number };
};
```

- Client cache: IndexedDB (`adv2-saves` / key `slot_local_1`) via `SaveStore`
- Migration runner: identity for `schemaVersion === 1` (`migrateSaveEnvelope`)
- Missing optional sections on older payloads are filled with defaults during validation (`createDefault*` helpers in `@adv/protocol`)
- Missing Phase-6 resource fields (`relics`, `totalRelics`, `artifacts`, `memoryDust`, `catalyst`) default to `"0"`
- Missing Phase-7 slices (`friends`, `clan`, `leaderboard`) default via `createDefaultFriendsSave` / `createDefaultClanSave` / `createDefaultLeaderboardSave`
- Chat history is ephemeral (not persisted in the envelope; global chat lives on the server)
- Battle state is ephemeral (not persisted)
- Cloud authority (Phase 4): registered sessions upsert the full `SaveEnvelope` JSON in SQLite `saves.saveData`
- Offline queue: pending envelopes under `cloud_pending_<userId>` until flush
- Conflict rule: newer `savedAt` wins when merging cloud vs local
- Account cutover: users table may migrate via `tools/migrate-v1-users/`
- **Phase 9 v1 save import:** `importV1Save` / `importV1SaveJson` in `@adv/protocol` maps v1 JSON (inner state, IDB envelope, or cloud `saveData`) → validated v2 `SaveEnvelope`. In-game: Options → import. CLI: `tools/migrate-v1-saves/`. Chat / battle state are dropped (ephemeral in v2).
