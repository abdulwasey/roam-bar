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

- `lib.rs` — tray icon + menu, popover toggle/hide-on-blur (suppressed while
  `PINNED` is set, i.e. a text field is focused so the macOS emoji palette can
  take focus), vibrancy, Accessory activation policy, first-run autostart,
  registers commands and the `Heartbeat` state.
  Lifecycle log at `/tmp/roam-bar-debug.log` (`dlog`).
- `commands.rs` — the IPC surface; thin wrappers over `activity.rs`.
- `activity.rs` — the one place that sets/clears/touches the status: calls
  `roam.rs`, drives `Heartbeat`, records the `Source` (`app`, `cli`, `claude`),
  updates the tray title, and emits `activity-changed` so the UI refreshes.
- `server.rs` — `tiny_http` listener on `127.0.0.1:47831` (`GET /activity`,
  `POST /activity|/touch|/clear`). Used by `bin/roambar` and the Claude hooks.
- `roam.rs` — HTTP client for `api.ro.am/v1`. One activity at a time under the
  fixed `externalId` `roambar:status`. `resolve_user` calls `token.info` for the
  token owner's id/name/email, then `user.info?id=` for the avatar `imageUrl`.
  Valid `display.color` values: blue, gold, gray, green, indigo, lime, orange,
  pink, purple, red, teal, yellow.
- `heartbeat.rs` — managed state holding one background task that re-posts the
  active activity every `ttl - 60s` while "keep alive" is on. Stopped on clear,
  on quit, or when `get_activities` sees nothing live.
- `config.rs` — Keychain keys: `roam_token`, `roam_user_id`, `roam_user_name`,
  `roam_user_email`, `roam_user_image`. Token only overwritten when non-empty.
  With no Keychain token, `load()` falls back to the compile-time
  `ROAM_DEV_TOKEN` env var (`option_env!`, dev convenience only). Release builds
  for sharing must be made without it so no token ships in the binary.
- `models.rs` — serde structs over IPC, `rename_all = "camelCase"`.

### Frontend (`src/`)

- `lib/api.ts` — typed `invoke()` wrappers, the only bridge to Rust.
- `lib/types.ts` — TS mirrors of `models.rs`, plus `ROAM_COLORS`.
- `lib/presets.ts` — the one-click preset catalog, grouped by `PRESET_GROUPS`. Edit here to add presets.
- `App.tsx` — polls `get_activities` every 30 s and on window focus; pins the
  window while an input is focused; Escape blurs, then hides.
- `components/` — `CurrentActivity` (with `SeatPreview`, a mock of the Roam seat;
  Edit prefills `CustomForm` via a `CustomDraft`), `PresetGrid`, `CustomForm`,
  `EmojiPicker` (search over `lib/emoji-data.json`, generated from Unicode's
  emoji-test.txt minus skin-tone variants), `Settings`.
- `bin/roambar`, `hooks/` — CLI and Claude Code hook scripts over the local API.

### Adding a command

Rust fn in `roam.rs` → `#[tauri::command]` in `commands.rs` → register in
`lib.rs` `generate_handler!` → wrapper in `lib/api.ts` → type in `lib/types.ts`.
New Tauri plugin permissions go in `src-tauri/capabilities/default.json`.

## Conventions

- No code comments.
- Keep the token out of logs, notifications, the webview, and shared builds.
- Roam renders only real Unicode emoji in the badge; shortcodes like `:smile:` are accepted by the API but show as text.
- `app-icon.png` at the root is the icon source; regenerate the set with `npx tauri icon app-icon.png` and delete the `android/`/`ios/` dirs it creates.
