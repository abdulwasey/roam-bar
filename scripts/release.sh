#!/usr/bin/env bash
# Build a share-safe, signed Roam Bar release without mounting anything in Finder,
# then publish DMG + updater artifacts + latest.json to GitHub.
#   npm run release      # uses the version from package.json
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="$(node -p 'require("./package.json").version')"
APP="Roam Bar"
KEY="${TAURI_SIGNING_PRIVATE_KEY_PATH:-$HOME/.tauri/roam-bar.key}"
MACOS="src-tauri/target/release/bundle/macos"
BUNDLE="$MACOS/$APP.app"
OUT="src-tauri/target/release/bundle/dmg"
DMG="$OUT/Roam Bar_${VERSION}_aarch64.dmg"
REPO="abdulwasey/roam-bar"

[ -f "$KEY" ] || { echo "Signing key not found at $KEY (generate: npx tauri signer generate -w $KEY)" >&2; exit 1; }

echo "▶ Building $APP $VERSION (app bundle, signed updater artifacts, no token)…"
env -u ROAM_DEV_TOKEN TAURI_SIGNING_PRIVATE_KEY="$(cat "$KEY")" TAURI_SIGNING_PRIVATE_KEY_PASSWORD="" \
  npm run tauri -- build --bundles app

if strings "src-tauri/target/release/roam-bar" | grep -q "^rmp-"; then
  echo "!!! A Roam token is compiled into the binary. Unset ROAM_DEV_TOKEN and rebuild." >&2
  exit 1
fi
echo "✓ Binary is token-free"

TARBALL="$MACOS/$APP.app.tar.gz"
SIG="$TARBALL.sig"
[ -f "$TARBALL" ] && [ -f "$SIG" ] || { echo "Updater artifacts missing (expected $TARBALL and .sig)" >&2; exit 1; }

echo "▶ Creating DMG with hdiutil (no Finder, no mount)…"
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT
cp -R "$BUNDLE" "$stage/"
ln -s /Applications "$stage/Applications"
mkdir -p "$OUT"
rm -f "$DMG"
hdiutil create -quiet -volname "$APP" -srcfolder "$stage" -ov -format UDZO "$DMG"
echo "✓ $DMG ($(du -h "$DMG" | cut -f1))"

ASSET_TAR="Roam.Bar_${VERSION}_aarch64.app.tar.gz"
cp "$TARBALL" "$stage/$ASSET_TAR"
cp "$SIG" "$stage/$ASSET_TAR.sig"
cat > "$stage/latest.json" <<JSON
{
  "version": "$VERSION",
  "notes": "Roam Bar $VERSION",
  "pub_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "platforms": {
    "darwin-aarch64": {
      "signature": "$(cat "$SIG")",
      "url": "https://github.com/$REPO/releases/download/v$VERSION/$ASSET_TAR"
    }
  }
}
JSON

if gh release view "v$VERSION" >/dev/null 2>&1; then
  echo "▶ Release v$VERSION exists, uploading assets…"
  gh release upload "v$VERSION" "$DMG" "$stage/$ASSET_TAR" "$stage/$ASSET_TAR.sig" "$stage/latest.json" --clobber
else
  echo "▶ Creating release v$VERSION…"
  gh release create "v$VERSION" "$DMG" "$stage/$ASSET_TAR" "$stage/$ASSET_TAR.sig" "$stage/latest.json" \
    --title "$APP $VERSION" \
    --notes "Install: \`curl -fsSL https://raw.githubusercontent.com/$REPO/main/scripts/install-from-release.sh | bash\`. Existing installs update themselves."
fi
echo "✓ Published v$VERSION"
