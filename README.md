# Roam Bar

A macOS **menu bar app** for setting your own Roam seat activity: one-click
presets (deep work, on a call, lunch…) or a custom emoji + title + color +
duration, with optional do-not-disturb and a keep-alive heartbeat that
re-posts long sessions past Roam's 60-minute TTL cap.

Built on the same skeleton as `ci-bar`: Tauri v2 (Rust) backend, React 19 +
Mantine 7 webview. The token never touches the webview; it lives in the macOS
Keychain under the service `com.realbrokerage.roambar`.

## Setup

```bash
npm install
npm run tauri:dev
```

Click the menu bar icon → gear → paste a Roam **personal access token**
(Roam → User Settings → Developer, with the `user activity` scope group).
Saving resolves your identity via `token.info` and stores it in the Keychain.
Alternatively copy `src-tauri/src/secrets.rs.example` to `secrets.rs` and set
the token there to compile it in.

## Build and install

```bash
npm run install:app   # release .app → /Applications/Roam Bar.app, relaunched
```

## API

Roam External Activity API, `https://api.ro.am/v1`:
`user.activity.set`, `user.activity.clear`, `user.activity.list`, `token.info`, `user.info`.
Docs: https://developer.ro.am/docs/guides/user-activity
