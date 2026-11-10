# Docker and dev container

`Dockerfile` defines a shared runtime with two targets:

- `prod` — the runtime used by the compose file.
- `dev` — the runtime plus git, sudo, Ruff, and mypy, used by the VS Code dev
  container.

Both install Node, pnpm, uv, and the pinned `coasti-planner` release into a
shared venv at `/opt/coasti/venv`. The VS Code configuration lives in
[`../.devcontainer/`](../.devcontainer/).

## Prerequisites

- Docker (Docker Desktop or a compatible engine).
- VS Code with the Dev Containers extension (for the dev container).
- A read-only Coasti npm-registry token in `REGISTRY_RO_TOKEN` until the
  `@coasti` packages are fully public. Set it in the **host** environment before
  starting VS Code:

```bash
# bash
export REGISTRY_RO_TOKEN="<read-only token>"

# powershell
$env:REGISTRY_RO_TOKEN = "<read-only token>"
```

## Dev container (recommended)

Open the extension folder in VS Code and run **Dev Containers: Reopen in
Container**. The first start builds the `dev` stage and installs dependencies
into Docker volumes; this takes a few minutes. The post-create script also
copies `config.dev.example.yml` to `config.dev.yml` when it is missing.

Use two integrated terminals, or the `dev:backend` / `dev:extension` tasks:

```bash
# terminal 1
coasti-planner config.dev.yml

# terminal 2
pnpm dev
```

Open `http://localhost:8000`. Ports `8000` and `5174` are forwarded
automatically.

### Checks

```bash
pnpm check        # oxlint + tsc + ruff + mypy
pnpm lint         # Oxlint (type-aware)
pnpm typecheck    # TypeScript 7
pnpm check:py     # ruff + mypy
pnpm format:check # oxfmt
```

The container installs basedpyright, Ruff, and Oxc extensions and points them at
the container-local `node_modules` and the `/opt/coasti/venv` interpreter, so
editor diagnostics and the CLI checks use the same binaries.

`node_modules` lives in a Docker volume because TypeScript 7, oxlint, and
tsgolint ship platform-specific binaries. The pnpm store is a shared volume for
hardlink deduplication. Dependencies are reinstalled on every container start;
rebuild the container after changing the Dockerfile or its tool version pins.

## Compose

`docker-compose.prod.yaml` builds the extension and serves the production bundle
from the backend. Use the dev container for local development.

It needs the `REGISTRY_RO_TOKEN` from the prerequisites above. Run the command
from the extension root.

```bash
docker compose -f docker/docker-compose.prod.yaml up --build
```

Open `http://localhost:8000`.

### Notes

- The compose file uses the `prod` stage; the dev container uses the `dev`
  stage.
- The image installs Node, pnpm, uv, and the pinned `coasti-planner` 0.2.2
  release, which bundles both the production and the development framework
  assets. The pin must expose the model API this extension uses; bump
  `COASTI_VERSION` once a framework branch with unreleased changes is published.
- Compose mounts this repository at `/app` and keeps `node_modules` and the pnpm
  store in Docker volumes.
- Rebuild the image after changing `entrypoint.prod.sh`.
- If pnpm reports an incompatible `node_modules` volume (for example
  `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`), the entrypoint recovers by
  purging it automatically. To start from a clean slate instead, remove the
  volumes with `docker compose -f docker/docker-compose.prod.yaml down -v`.

## Related

Host setup and development users are documented in
[`../README.md`](../README.md).
