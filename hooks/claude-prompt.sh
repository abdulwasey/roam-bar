#!/usr/bin/env bash
# Claude Code UserPromptSubmit hook. For sessions under ~/Desktop/REAL, extends
# the TTL of a Roam Bar status that Claude set (source=claude). Sets nothing itself
# and never touches a status you picked yourself.
set -uo pipefail
input="$(cat)"
cwd="$(printf '%s' "$input" | jq -r '.cwd // empty')"
case "$cwd" in
  "$HOME/Desktop/REAL"/*|"$HOME/Desktop/REAL") ;;
  *) exit 0 ;;
esac
"$(cd "$(dirname "$0")/.." && pwd)/bin/roambar" touch --minutes 15 --if-source claude >/dev/null 2>&1
exit 0
