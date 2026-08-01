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
  hero: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    created: boolean;
    level: number;
    experience: number;
    expToNext: number;
    baseStats: StatBlock;
    spentStats: StatBlock;
    unspentStatPoints: number;
    equipment: Record<EquipmentSlot, ItemSave | null>;
    inventory: { equipment: ItemSave[] };
    prestige: { bossProgress: number; defeatedBosses: number[] };
    unlockedSkills: string[];
  };
  story: {
    storyFightsIntroSeen: boolean;
    selectedChapter: number;
  };
  settings: { locale: "de" | "en" };
  meta: { lastActiveAt: number };
};
```

- Client cache: IndexedDB (`adv2-saves` / key `slot_local_1`) via `SaveStore`
- Migration runner: identity for `schemaVersion === 1` (`migrateSaveEnvelope`)
- Missing `hero` / `story` / `settings` on older Phase-2 payloads are filled with defaults during validation
- Battle state is ephemeral (not persisted)
- Cloud authority (Phase 4): registered sessions upsert the full `SaveEnvelope` JSON in SQLite `saves.saveData`
- Offline queue: pending envelopes under `cloud_pending_<userId>` until flush
- Conflict rule: newer `savedAt` wins when merging cloud vs local
- v1 cloud blobs are discarded; only the users table may migrate (see `tools/migrate-v1-users/`)
