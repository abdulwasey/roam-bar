#!/usr/bin/env bash
# Claude Code SessionEnd hook. Clears the Roam Bar status only if Claude set it.
set -uo pipefail
input="$(cat)"
cwd="$(printf '%s' "$input" | jq -r '.cwd // empty')"
case "$cwd" in
  "$HOME/Desktop/REAL"/*|"$HOME/Desktop/REAL") ;;
  *) exit 0 ;;
esac
"$(cd "$(dirname "$0")/.." && pwd)/bin/roambar" clear --if-source claude >/dev/null 2>&1
exit 0
