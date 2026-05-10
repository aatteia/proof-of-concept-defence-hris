#!/usr/bin/env bash
# scripts/commit-msg.sh
# ─────────────────────────────────────────────────────────────────────────────
# Automatically bumps package.json version on every commit based on the
# conventional commit prefix, then stages the change so it is included
# in the same commit — no separate version bump commits needed.
#
# Bump rules:
#   feat:              → minor  (1.3.0 → 1.4.0)
#   fix: / chore: etc  → patch  (1.3.0 → 1.3.1)
#   BREAKING CHANGE    → major  (1.3.0 → 2.0.0)
#
# Install: npm run install:hooks
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# Git hooks run with a stripped PATH — add common node locations so the
# node binary is reachable regardless of how node was installed.
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/$(ls "$HOME/.nvm/versions/node" 2>/dev/null | sort -V | tail -1)/bin:$(dirname "$(which node 2>/dev/null || echo /usr/local/bin/node)"):$PATH"

COMMIT_MSG_FILE="$1"
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# ── Skip conditions ───────────────────────────────────────────────────────────

# In-progress merge or rebase — don't interfere
[[ -f ".git/MERGE_HEAD" ]]           && exit 0
[[ -d ".git/rebase-merge" ]]         && exit 0
[[ -d ".git/rebase-apply" ]]         && exit 0

# Already a version bump commit (prevents double-bumping on amend)
[[ "$COMMIT_MSG" =~ ^chore:\ bump\ version ]] && exit 0

# Interactive rebase fixup/squash commits
[[ "$COMMIT_MSG" =~ ^(fixup|squash)! ]] && exit 0

# ── Determine bump type ───────────────────────────────────────────────────────

BUMP="patch"

# Breaking change — any commit type with ! suffix or BREAKING CHANGE in body
if echo "$COMMIT_MSG" | grep -qE "(BREAKING[- ]CHANGE|^[a-z]+(\([^)]+\))?!:)"; then
  BUMP="major"
# New feature
elif echo "$COMMIT_MSG" | grep -qE "^feat(\([^)]+\))?:"; then
  BUMP="minor"
fi

# ── Compute new version ───────────────────────────────────────────────────────

CURRENT=$(node -p "require('./package.json').version" 2>/dev/null) || {
  echo "⚠️  Could not read package.json version — skipping auto-bump" >&2
  exit 0
}

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case $BUMP in
  major) NEW="$((MAJOR + 1)).0.0" ;;
  minor) NEW="$MAJOR.$((MINOR + 1)).0" ;;
  patch) NEW="$MAJOR.$MINOR.$((PATCH + 1))" ;;
esac

# ── Write and stage package.json ──────────────────────────────────────────────

node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.version = '$NEW';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
" 2>/dev/null || {
  echo "⚠️  Could not write package.json — skipping auto-bump" >&2
  exit 0
}

git add package.json

# Write new version for post-commit hook to tag
echo "$NEW" > .git/NEXT_VERSION

echo "🔖  $CURRENT → $NEW ($BUMP)"
