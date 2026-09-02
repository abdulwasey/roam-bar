#!/usr/bin/env bash
# Build Roam Bar (release) and install it to /Applications, then relaunch.
set -euo pipefail

cd "$(dirname "$0")/.."

APP="src-tauri/target/release/bundle/macos/Roam Bar.app"
DEST="/Applications/Roam Bar.app"

echo "▶ Building Roam Bar (release, .app only)…"
npm run tauri -- build --bundles app

echo "▶ Quitting any running copy…"
osascript -e 'tell application "Roam Bar" to quit' >/dev/null 2>&1 || true
pkill -f "/Applications/Roam Bar.app/Contents/MacOS" >/dev/null 2>&1 || true
sleep 1

echo "▶ Installing to /Applications…"
rm -rf "$DEST"
cp -R "$APP" /Applications/
xattr -dr com.apple.quarantine "$DEST" >/dev/null 2>&1 || true

echo "▶ Launching…"
open "$DEST"
echo "✓ Installed and launched: $DEST"
