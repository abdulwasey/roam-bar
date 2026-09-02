#!/usr/bin/env bash
# Claude Code UserPromptSubmit hook. Keeps a Roam Bar status alive while
# Claude is working under ~/Desktop/REAL. Never overrides a status you set yourself.
set -uo pipefail
input="$(cat)"
cwd="$(printf '%s' "$input" | jq -r '.cwd // empty')"
case "$cwd" in
  "$HOME/Desktop/REAL"/*|"$HOME/Desktop/REAL") ;;
  *) exit 0 ;;
esac
ROAMBAR="$(cd "$(dirname "$0")/.." && pwd)/bin/roambar"
state="$("$ROAMBAR" status 2>/dev/null)" || exit 0
active="$(printf '%s' "$state" | jq -r '[.activities[] | select(.externalId=="roambar:status")] | length')"
source="$(printf '%s' "$state" | jq -r '.source // empty')"
if [ "$active" != "0" ]; then
  [ "$source" = "claude" ] && "$ROAMBAR" touch --minutes 15 --if-source claude >/dev/null 2>&1
  exit 0
fi
repo="$(basename "$(git -C "$cwd" rev-parse --show-toplevel 2>/dev/null || echo "$cwd")")"
branch="$(git -C "$cwd" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
subtitle="$repo"; [ -n "$branch" ] && subtitle="$repo · $branch"
"$ROAMBAR" set "🤖" "Pairing with Claude" "$subtitle" --color teal --minutes 15 --source claude >/dev/null 2>&1
exit 0
