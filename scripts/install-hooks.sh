#!/usr/bin/env bash
# scripts/install-hooks.sh
# ─────────────────────────────────────────────────────────────────────────────
# Symlinks git hooks from scripts/ into .git/hooks/.
# Run once after cloning: npm run install:hooks
# (Also runs automatically on npm install via the prepare script.)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$(git rev-parse --git-dir)/hooks"
SCRIPTS_DIR="$REPO_ROOT/scripts"

install_hook() {
  local name="$1"
  local src="$SCRIPTS_DIR/$name.sh"
  local dst="$HOOKS_DIR/$name"

  if [ ! -f "$src" ]; then
    echo "  ⚠️  $src not found — skipping"
    return
  fi

  chmod +x "$src"

  # Back up any existing non-symlink hook rather than clobbering it
  if [ -L "$dst" ]; then
    rm "$dst"
  elif [ -f "$dst" ]; then
    echo "  Backing up existing $name hook → $name.bak"
    mv "$dst" "$dst.bak"
  fi

  ln -s "$src" "$dst"
  echo "  ✅ $name"
}

echo "Installing git hooks…"
install_hook "commit-msg"
install_hook "post-commit"
echo "Done — hooks active for this clone."
