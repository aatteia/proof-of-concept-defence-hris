#!/usr/bin/env bash
# scripts/post-commit.sh
# ─────────────────────────────────────────────────────────────────────────────
# Creates an annotated git tag for the version bumped by commit-msg.sh.
# Only runs if commit-msg.sh wrote a .git/NEXT_VERSION file.
#
# This hook fires after the commit is finalised, so the tag is attached
# to the correct commit. The NEXT_VERSION file is the handshake — it is
# written by commit-msg.sh and deleted here after reading.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

VERSION_FILE=".git/NEXT_VERSION"

[ -f "$VERSION_FILE" ] || exit 0

NEW=$(cat "$VERSION_FILE")
rm -f "$VERSION_FILE"

git tag -a "v$NEW" -m "v$NEW" 2>/dev/null && echo "🏷   Tagged v$NEW" || true
