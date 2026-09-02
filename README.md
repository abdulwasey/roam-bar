# Roam Bar

A macOS **menu bar app** for setting your own Roam seat activity: one-click
presets (deep work, on a call, lunch…) or a custom emoji + title + color +
duration, with optional do-not-disturb and a keep-alive heartbeat that
re-posts long sessions past Roam's 60-minute TTL cap.

Built on the same skeleton as `~/Desktop/REAL/ci-bar`: Tauri v2 (Rust) backend, React 19 +
Mantine 7 webview. The token never touches the webview; it lives in the macOS
Keychain under the service `com.realbrokerage.roambar`.

## Install (no build tools needed)

```bash
curl -fsSL https://raw.githubusercontent.com/abdulwasey/roam-bar/main/scripts/install-from-release.sh | bash
```

That downloads the latest DMG from [Releases](https://github.com/abdulwasey/roam-bar/releases),
copies the app to `/Applications`, clears the Gatekeeper quarantine flag, and
launches it. Or download the DMG from Releases yourself, drag the app to
Applications, then right-click → Open the first time (the build is not
notarized). Apple Silicon only.

Then click the menu bar icon → gear → paste a Roam **personal access token**
(Roam → User Settings → Developer, `user activity` scope group). It stays in
your Keychain.

## Develop

```bash
npm install
npm run tauri:dev
```

For your own dev builds you can compile a token in instead of pasting it:

```fish
set -Ux ROAM_DEV_TOKEN rmp-…   # fish; persists across shells
npm run tauri:dev
```

Never set `ROAM_DEV_TOKEN` when building something you plan to share.

## Build and install

```bash
npm run install:app   # release .app → /Applications/Roam Bar.app, relaunched
```

## Sharing a build

```bash
env -u ROAM_DEV_TOKEN npm run tauri:build
open src-tauri/target/release/bundle/dmg/
```

That produces `Roam Bar_<version>_aarch64.dmg` with no token inside. Each
person drags the app to Applications, launches it, opens Settings and pastes
their own Roam personal access token. Tokens only ever live in that person's
Keychain.

**Gatekeeper.** The build is ad-hoc signed, not notarized, so on first launch
macOS shows "cannot be opened because Apple cannot check it for malicious
software". Recipients either right-click the app → Open, or run:

```bash
xattr -dr com.apple.quarantine "/Applications/Roam Bar.app"
```

To remove that step you need a Developer ID certificate and notarization
(Apple Developer Program). Tauri supports it via the `APPLE_SIGNING_IDENTITY`,
`APPLE_ID`, `APPLE_PASSWORD` and `APPLE_TEAM_ID` env vars at build time; see
https://tauri.app/distribute/sign/macos/.

The app is Apple Silicon only as built. Add `--target universal-apple-darwin`
to `tauri build` for an Intel + Apple Silicon universal binary.

## Local API and CLI

While the app runs it listens on `127.0.0.1:47831`:

| Route | Body | Effect |
| --- | --- | --- |
| `GET /activity` | | live activities, `keepAlive`, and `source` of the app-owned one |
| `POST /activity` | `{emoji,title,subtitle?,color?,minutes?,dnd?,keepAlive?,source?}` | set the status |
| `POST /touch` | `{minutes?,ifSource?}` | extend the current status' TTL |
| `POST /clear` | `{ifSource?}` | clear it (skipped if `ifSource` doesn't match) |

`bin/roambar` wraps it. Put it on your PATH with
`ln -s ~/Desktop/CODE/roam-bar/bin/roambar /opt/homebrew/bin/roambar`.

```bash
roambar set 🧑‍🔧 "Fixing E2E" "bolt · RV2-76279" --color teal --minutes 30
roambar touch --minutes 15 --if-source claude
roambar clear
roambar status
```

## API

Roam External Activity API, `https://api.ro.am/v1`:
`user.activity.set`, `user.activity.clear`, `user.activity.list`, `token.info`, `user.info`.
Docs: https://developer.ro.am/docs/guides/user-activity
