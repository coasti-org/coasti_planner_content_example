#!/usr/bin/env bash
# Runs once after the container is created or rebuilt. The image provides the
# pinned toolchain; this script prepares workspace state that cannot live in an
# image: install dependencies into the workspace's node_modules volume, make
# Docker-created volume mounts writable, load the registry token, and create
# local config/database files.
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repo_root"
env_file="$repo_root/.env"

# The token can live in the gitignored .env file. A filled value wins over the
# container environment so editing the file is enough to rotate the token.
file_token=""
if [ -f "$env_file" ]; then
  file_token=$(
    sed -n \
      -e 's/^REGISTRY_RO_TOKEN=//p' \
      -e 's/^export REGISTRY_RO_TOKEN=//p' \
      "$env_file" | tail -n 1 | tr -d '\r'
  )
  file_token=${file_token%\"}
  file_token=${file_token#\"}
  file_token=${file_token%\'}
  file_token=${file_token#\'}
fi

if [ -n "$file_token" ]; then
  REGISTRY_RO_TOKEN=$file_token
  export REGISTRY_RO_TOKEN
fi

if [ -z "${REGISTRY_RO_TOKEN:-}" ]; then
  echo "REGISTRY_RO_TOKEN is not set." >&2
  echo "Copy .env.example to .env in the repository root and fill in a" >&2
  echo "read-only @coasti token, then rerun:" >&2
  echo "  bash .devcontainer/post-create.sh" >&2
  exit 1
fi

# Docker creates the volume mount points as root; give them to the remote user.
sudo chown -R node:node node_modules /pnpm-store

# Store the literal token rather than an environment reference: later terminals
# and tasks do not inherit a manually exported variable. pnpm keeps the token in
# its own auth.ini (not ~/.npmrc), so write through pnpm and protect the file.
pnpm config set "//git.linkfish.eu/api/packages/coasti/npm/:_authToken" "$REGISTRY_RO_TOKEN"
pnpm config set store-dir /pnpm-store
chmod 600 "${XDG_CONFIG_HOME:-$HOME/.config}/pnpm/auth.ini"

# No TTY during postCreate; CI mode lets pnpm replace an incompatible persisted
# node_modules volume instead of aborting.
CI=true pnpm install --frozen-lockfile

[ -f config.dev.yml ] || cp config.dev.example.yml config.dev.yml
[ -f data/dummy.sqlite ] || python scripts/generate_dummy_database.py
