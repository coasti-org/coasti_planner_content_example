#!/bin/sh
set -eu

# The container has no TTY. Running pnpm in CI mode lets it replace an
# incompatible persisted node_modules volume instead of aborting, and covers
# the implicit install that `pnpm build` triggers.
export CI=true

registry_token_file=/run/secrets/registry_ro_token
registry_token_key="//git.linkfish.eu/api/packages/coasti/npm/:_authToken"

cleanup_registry_token() {
  pnpm config delete "$registry_token_key" >/dev/null 2>&1 || true
}

pnpm config set store-dir /pnpm_store
trap cleanup_registry_token EXIT
pnpm config set "$registry_token_key" "$(cat "$registry_token_file")"
pnpm install --frozen-lockfile
cleanup_registry_token
trap - EXIT

pnpm build

exec coasti-planner config.prod.example.yml
