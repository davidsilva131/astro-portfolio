#!/usr/bin/env bash
# emdash-scan.sh - scan committed copy for banned em-dashes / en-dashes (taste-skill rule 9.G).
# Usage: scripts/emdash-scan.sh [path]   (default: src/)
# Exit 0 = clean; 1 = matches found and printed; 2 = bad path.
set -u
TARGET="${1:-src}"
if [ ! -d "$TARGET" ]; then
  echo "error: $TARGET is not a directory" >&2
  exit 2
fi
if grep -rn -e "—" -e "–" "$TARGET"; then
  echo "FOUND em/en-dashes above. Replace with plain hyphens." >&2
  exit 1
else
  echo "Clean: no em/en-dashes in $TARGET"
  exit 0
fi
