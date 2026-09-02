# CLAUDE.md

## What this is

Roam Bar is a macOS menu bar app (no Dock icon, launches at login) that sets
the current user's Roam seat activity through Roam's External Activity API.
Tauri v2: React/Mantine webview, Rust backend. **All secrets and all network
I/O live in Rust.** The personal access token is stored in the macOS Keychain
(service `com.realbrokerage.roambar`) and never reaches the webview.

## Commands

```bash
npm install              # JS deps
npm run tauri:dev        # dev (Vite on :1421 + Tauri shell)
npm run tauri:build      # release build
npm run install:app      # build .app, install to /Applications, relaunch
npm run build            # tsc typecheck + vite build
cd src-tauri && cargo check && cargo clippy
```

No test suite. `npm run build` is the frontend typecheck; `cargo clippy` the Rust gate.

## Architecture

### Backend (`src-tauri/src/`)

- `lib.rs` — tray icon + menu, popover show/hide, vibrancy, Accessory activation
  policy, first-run autostart, registers commands and the `Heartbeat` state.
  Lifecycle log at `/tmp/roam-bar-debug.log` (`dlog`).
- `commands.rs` — the IPC surface. Each command loads config from Keychain,
  calls `roam.rs`, and updates the tray title to the active emoji.
- `roam.rs` — HTTP client for `api.ro.am/v1`. One activity at a time under the
  fixed `externalId` `roambar:status`. `resolve_user` pages `user.list` by
  `cursor` to match the saved email (the API has no whoami and no email filter).
  Valid `display.color` values: blue, gold, gray, green, indigo, lime, orange,
  pink, purple, red, teal, yellow.
- `heartbeat.rs` — managed state holding one background task that re-posts the
  active activity every `ttl - 60s` while "keep alive" is on. Stopped on clear,
  on quit, or when `get_activities` sees nothing live.
- `config.rs` — Keychain keys: `roam_token`, `roam_email`, `roam_user_id`,
  `roam_user_name`. Token only overwritten when a non-empty value is saved.
- `models.rs` — serde structs over IPC, `rename_all = "camelCase"`.

### Frontend (`src/`)

- `lib/api.ts` — typed `invoke()` wrappers, the only bridge to Rust.
- `lib/types.ts` — TS mirrors of `models.rs`, plus `ROAM_COLORS`.
- `lib/presets.ts` — the one-click preset catalog. Edit here to add presets.
- `App.tsx` — polls `get_activities` every 30 s and on window focus.
- `components/` — `CurrentActivity`, `PresetGrid`, `CustomForm`, `Settings`.

### Adding a command

Rust fn in `roam.rs` → `#[tauri::command]` in `commands.rs` → register in
`lib.rs` `generate_handler!` → wrapper in `lib/api.ts` → type in `lib/types.ts`.
New Tauri plugin permissions go in `src-tauri/capabilities/default.json`.

## Conventions

- No code comments.
- Keep the token out of logs, notifications, and the webview.
