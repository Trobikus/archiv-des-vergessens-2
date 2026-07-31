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
  meta: { lastActiveAt: number };
};
```

- Client cache: IndexedDB (`adv2-saves` / key `slot_local_1`) via `SaveStore`
- Migration runner: identity for `schemaVersion === 1` (`migrateSaveEnvelope`)
- Cloud authority: Phase 4