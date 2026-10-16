#!/bin/sh
set -eu

registry_token_file=/run/secrets/registry_ro_token
registry_token_key="//git.linkfish.eu/api/packages/coasti/npm/:_authToken"

cleanup_registry_token() {
  pnpm config delete "$registry_token_key" >/dev/null 2>&1 || true
}

pnpm config set store-dir /pnpm-store
trap cleanup_registry_token EXIT
pnpm config set "$registry_token_key" "$(cat "$registry_token_file")"
pnpm install --frozen-lockfile
cleanup_registry_token
trap - EXIT

uv python install 3.13
uv tool install coasti_planner --python 3.13
pnpm build

exec coasti-planner docker/config.docker.yml
