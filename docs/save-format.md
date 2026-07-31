# Save format (Phase 0)

```ts
type SaveEnvelope = {
  schemaVersion: 1;
  savedAt: number;
  payload: unknown;
};
```

`payload` remains opaque until Phase 2 (resources / offline progress). Migration runner: identity migration for `schemaVersion === 1`.
