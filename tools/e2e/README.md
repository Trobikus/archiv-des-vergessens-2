# @adv/e2e

Playwright smoke tests against the built `@adv/client` (same assets the Tauri webview loads).

## Prerequisites

```powershell
npm run build -w @adv/client
npx playwright install chromium
```

## Run

```powershell
npm run e2e
```

Smoke covers: document title, intro view, boot completion (skip), login gate, no page errors. No game server required (offline boot path).
