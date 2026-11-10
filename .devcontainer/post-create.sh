#!/usr/bin/env bash
set -euo pipefail

if [ -z "${REGISTRY_RO_TOKEN:-}" ]; then
  echo "REGISTRY_RO_TOKEN is not set on the host." >&2
  echo "Export a read-only @coasti registry token, then reopen the container." >&2
  exit 1
fi

# Docker creates the volume mount points as root; give them to the remote user.
sudo chown -R node:node node_modules /pnpm-store

# Reference the token through the environment instead of storing it on disk.
cat > "$HOME/.npmrc" <<'EOF'
//git.linkfish.eu/api/packages/coasti/npm/:_authToken=${REGISTRY_RO_TOKEN}
store-dir=/pnpm-store
EOF

# No TTY during postCreate; CI mode lets pnpm replace an incompatible persisted
# node_modules volume instead of aborting.
CI=true pnpm install --frozen-lockfile

[ -f config.dev.yml ] || cp config.dev.example.yml config.dev.yml
[ -f data/dummy.sqlite ] || python scripts/generate_dummy_database.py
