#!/usr/bin/env bash
# Install the latest Roam Bar release into /Applications.
#   curl -fsSL https://raw.githubusercontent.com/abdulwasey/roam-bar/main/scripts/install-from-release.sh | bash
set -euo pipefail

REPO="abdulwasey/roam-bar"
APP="Roam Bar"
DEST="/Applications/$APP.app"

echo "▶ Finding the latest release…"
url="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep -o '"browser_download_url": *"[^"]*\.dmg"' | head -1 | sed 's/.*"\(https[^"]*\)"/\1/')"
[ -n "$url" ] || { echo "No DMG found on the latest release of $REPO" >&2; exit 1; }

tmp="$(mktemp -d)"
trap 'hdiutil detach "$tmp/mnt" >/dev/null 2>&1 || true; rm -rf "$tmp"' EXIT
echo "▶ Downloading $(basename "$url")…"
curl -fL --progress-bar "$url" -o "$tmp/roam-bar.dmg"

echo "▶ Mounting…"
mkdir -p "$tmp/mnt"
hdiutil attach "$tmp/roam-bar.dmg" -mountpoint "$tmp/mnt" -nobrowse -quiet

echo "▶ Quitting any running copy…"
osascript -e "tell application \"$APP\" to quit" >/dev/null 2>&1 || true
sleep 1

echo "▶ Installing to /Applications…"
rm -rf "$DEST"
cp -R "$tmp/mnt/$APP.app" "$DEST"
xattr -dr com.apple.quarantine "$DEST" >/dev/null 2>&1 || true

echo "▶ Launching…"
open "$DEST"
echo "✓ Installed $DEST. Click the menu bar icon → gear → paste your Roam token."
