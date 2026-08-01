# Third-Party Notices / Hinweise zu Drittkomponenten

**Archiv des Vergessens** · Grimoire Interactive  
**Stand / Effective date:** 1. August 2026

Das Projekt enthält Open-Source- und Drittkomponenten. Die proprietäre Lizenz des Spiels ([`LICENSE`](../../LICENSE)) gilt für eigene Inhalte von Grimoire Interactive. Für die nachfolgend genannten Komponenten gelten deren jeweiligen Lizenzen; bei Konflikt gehen die zwingenden Bedingungen der Komponentenlizenz für diese Komponente vor.

This project includes open-source and third-party components. The proprietary game licence ([`LICENSE`](../../LICENSE)) covers Grimoire Interactive’s own materials. The components below are governed by their respective licences; mandatory component licence terms prevail for that component in case of conflict.

Vollständige Transitivabhängigkeiten ergeben sich aus `package-lock.json` sowie den Cargo-Lockfiles unter `apps/desktop/src-tauri` und `apps/launcher/src-tauri`.  
Full transitive dependency trees are recorded in `package-lock.json` and the Cargo lockfiles under `apps/desktop/src-tauri` and `apps/launcher/src-tauri`.

---

## 1. Runtime & UI / Laufzeit & Oberfläche

| Component | Role | Licence (typical / upstream) |
|---|---|---|
| **Preact** | UI framework (client) | MIT |
| **Vite** / `@preact/preset-vite` | Client bundler (build) | MIT |
| **TypeScript** | Language / toolchain | Apache-2.0 |
| **ws** | WebSocket server | MIT |
| **better-sqlite3** | Server SQLite bindings | MIT |
| **Node.js** (runtime, not vendored in this repo) | Server runtime | Node.js licence ( incl. MIT-style terms) |

## 2. Desktop & Launcher (Tauri / Rust)

| Component | Role | Licence (typical / upstream) |
|---|---|---|
| **Tauri** (and Tauri CLI) | Desktop / launcher shell | MIT OR Apache-2.0 |
| **tauri-plugin-updater** | In-app updates | MIT OR Apache-2.0 |
| **tauri-plugin-process** | Process helpers | MIT OR Apache-2.0 |
| **tauri-plugin-opener** | Open URLs | MIT OR Apache-2.0 |
| **serde** / **serde_json** | Serialization | MIT OR Apache-2.0 |
| **reqwest** | HTTP (launcher) | MIT OR Apache-2.0 |
| **tokio** | Async runtime (launcher) | MIT |
| **futures-util** | Async utilities | MIT OR Apache-2.0 |
| **zip** | Archive extract (launcher) | MIT |
| **dirs** | Path helpers (launcher) | MIT OR Apache-2.0 |
| **ed25519-dalek** | Signature verify (launcher) | BSD-3-Clause |
| **hex** | Hex encoding | MIT OR Apache-2.0 |
| **WebView2** (Windows, system component) | Embedded webview | Microsoft software terms (system dependency) |

## 3. Fonts / Schriftarten

| Font | Use | Licence |
|---|---|---|
| **Cinzel** | Headings / brand typography | SIL Open Font License 1.1 |
| **Inter** | UI body text | SIL Open Font License 1.1 |

In aktuellen Builds werden Cinzel und Inter über **Google Fonts** geladen (`fonts.googleapis.com` / `fonts.gstatic.com`). Dabei können technische Daten (z. B. IP-Adresse) an Google übermittelt werden — siehe [Datenschutzerklärung / Privacy Policy](PRIVACY.md).

In current builds, Cinzel and Inter are loaded via **Google Fonts**. Technical data (e.g. IP address) may be sent to Google — see the [Privacy Policy](PRIVACY.md).

SIL OFL 1.1 summary: fonts may be used, studied, modified, and redistributed under OFL terms; the fonts alone may not be sold; derivative names must follow OFL reserved-name rules; redistribution must include the licence text. Full OFL text: https://openfontlicense.org/ / https://scripts.sil.org/OFL

## 4. Development & quality tooling (not shipped to end users)

| Component | Role | Licence (typical / upstream) |
|---|---|---|
| **ESLint** (+ plugins/configs used in repo) | Linting | MIT |
| **Vitest** / coverage tooling | Tests | MIT |
| **Playwright** | End-to-end tests | Apache-2.0 |
| **fake-indexeddb** | Test utility | Apache-2.0 |

Diese Werkzeuge sind Teil der Entwicklungsumgebung und typischerweise **nicht** Bestandteil der Endnutzer-Spielbuilds.  
These tools are part of the development environment and are typically **not** part of end-user game builds.

## 5. External services contacted by clients

| Service | Purpose | Operator |
|---|---|---|
| Game WebSocket server | Auth, cloud save, chat, leaderboard | Grimoire Interactive (hosted on **Google**, USA) |
| GitHub Releases / API | Desktop updater feed, launcher downloads | GitHub (Microsoft) |
| Google Fonts | Font CSS/files for client & launcher | Google |

Nutzungsbedingungen und Datenschutz der jeweiligen Anbieter gelten zusätzlich für deren Infrastruktur.  
The providers’ own terms and privacy policies also apply to their infrastructure.

## 6. Licence texts / Lizenztexte

Maßgeblich sind die Upstream-Lizenztexte der jeweiligen Projekte (npm-Paketmetadaten, Crates.io, Projekt-Repositories). Auf Anfrage an **grimoire.interactive@gmail.com** stellen wir, soweit zumutbar, eine Zusammenstellung der Lizenztexte zu einer konkreten Release-Version zur Verfügung.

The governing texts are the upstream licence files of each project (npm package metadata, crates.io, upstream repositories). On request to **grimoire.interactive@gmail.com**, we will provide, where reasonable, a compilation of licence texts for a specific release version.

---

### MIT License (reference summary)

Permission is hereby granted, free of charge, to any person obtaining a copy of the relevant MIT-licensed software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the copyright and permission notice being included in all copies or substantial portions. THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND.

### Apache License 2.0 (reference summary)

Apache-2.0 licensed components may be used under the terms of the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0). Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.

---

© 2026 Grimoire Interactive. Eigene Spielinhalte und Marken sind nicht durch die vorstehenden Open-Source-Lizenzen freigegeben.  
© 2026 Grimoire Interactive. Original game content and marks are not licensed under the open-source licences above.
