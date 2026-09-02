#!/usr/bin/env bash
# Build a share-safe Roam Bar DMG (no token) without mounting anything in Finder,
# verify the binary is token-free, and publish it as a GitHub release.
#   scripts/release.sh            # uses the version from package.json
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="$(node -p 'require("./package.json").version')"
APP="Roam Bar"
BUNDLE="src-tauri/target/release/bundle/macos/$APP.app"
OUT="src-tauri/target/release/bundle/dmg"
DMG="$OUT/Roam Bar_${VERSION}_aarch64.dmg"

echo "▶ Building $APP $VERSION (app bundle only, no token)…"
env -u ROAM_DEV_TOKEN npm run tauri -- build --bundles app

if strings "src-tauri/target/release/roam-bar" | grep -q "^rmp-"; then
  echo "!!! A Roam token is compiled into the binary. Unset ROAM_DEV_TOKEN and rebuild." >&2
  exit 1
fi
echo "✓ Binary is token-free"

echo "▶ Creating DMG with hdiutil (no Finder, no mount)…"
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT
cp -R "$BUNDLE" "$stage/"
ln -s /Applications "$stage/Applications"
mkdir -p "$OUT"
rm -f "$DMG"
hdiutil create -quiet -volname "$APP" -srcfolder "$stage" -ov -format UDZO "$DMG"
echo "✓ $DMG ($(du -h "$DMG" | cut -f1))"

if gh release view "v$VERSION" >/dev/null 2>&1; then
  echo "▶ Release v$VERSION exists, uploading asset…"
  gh release upload "v$VERSION" "$DMG" --clobber
else
  echo "▶ Creating release v$VERSION…"
  gh release create "v$VERSION" "$DMG" --title "$APP $VERSION" --notes "Install: \`curl -fsSL https://raw.githubusercontent.com/abdulwasey/roam-bar/main/scripts/install-from-release.sh | bash\`"
fi
echo "✓ Published v$VERSION"
