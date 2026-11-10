# Docker and dev container

`Dockerfile` defines a shared runtime with two targets:

- `prod` — the runtime used by the compose file.
- `dev` — the runtime plus git, sudo, Ruff, and mypy, used by the VS Code dev
  container.

Both install Node, pnpm, uv, and the pinned `coasti-planner` release into a
shared venv at `/opt/coasti/venv`. The recommended entry point is
[`../content_example.code-workspace`](../content_example.code-workspace), which
carries the shared editor settings; the container definition lives in
[`../.devcontainer/`](../.devcontainer/). Host setup and the example accounts
are documented in the root [`README.md`](../README.md).

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

Open [`../content_example.code-workspace`](../content_example.code-workspace) in
VS Code, then run **Dev Containers: Open Workspace in Container...**. Set
`REGISTRY_RO_TOKEN` first (see [Prerequisites](#prerequisites)). The workspace
file carries the shared editor settings; the container adds the interpreter
paths and extensions. The first start builds the `dev` stage and installs
dependencies into Docker volumes; this takes a few minutes. The post-create
script also copies `config.dev.example.yml` to `config.dev.yml` when it is
missing.

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

These are the CLI equivalents of the editor checks. The container runs
basedpyright, Ruff, Oxc, and the TypeScript server against the same
`node_modules` and `/opt/coasti/venv` interpreter.

## Other editors

VS Code is not required. The repository is a bind mount and the container
provides the toolchain, so you can edit on the host and run commands in the
container. Use the Docker command below when the app must be reachable from a
host browser; the Dev Containers CLI runs the same lifecycle but does not
publish ports.

Run these from the extension root:

```bash
export REGISTRY_RO_TOKEN="<read-only token>"

docker build --target dev -f docker/Dockerfile -t coasti-content-example-dev .

docker run --rm -it --init --name coasti-content-example-dev \
  --user node \
  -w /workspaces/content_example \
  -e REGISTRY_RO_TOKEN \
  -v "$PWD:/workspaces/content_example" \
  -v content_example-node-modules:/workspaces/content_example/node_modules \
  -v coasti-pnpm-store:/pnpm-store \
  -p 8000:8000 -p 5174:5174 \
  coasti-content-example-dev bash
```

Inside the container, prepare the workspace and start the backend:

```bash
bash .devcontainer/post-create.sh
coasti-planner config.dev.yml
```

In a second host terminal, start the extension and run the checks:

```bash
docker exec -it coasti-content-example-dev pnpm dev
docker exec -it coasti-content-example-dev pnpm check
```

Open `http://localhost:8000`. Edits on the host are visible through the bind
mount. Stop the stack with `docker stop coasti-content-example-dev`; `--rm`
removes the container, while the named volumes persist.

**Notes**

- The command mirrors the mounts, volumes, user, environment, and ports from
  `.devcontainer/devcontainer.json`; keep them in sync.
- `post-create.sh` installs dependencies into the workspace volume and writes
  `config.dev.yml`. Run it once per new container.
- On Linux, the container runs as uid/gid 1000 (`node`). If your host UID
  differs, use the Dev Containers CLI, which remaps the UID, or adjust the mount
  ownership.
- On Windows, run the commands from WSL2.
- The Dev Containers CLI is the canonical non-VS Code lifecycle runner:
  `npx @devcontainers/cli up --workspace-folder .` and
  `npx @devcontainers/cli exec --workspace-folder . bash`. It does not publish
  ports, so use the Docker command above for a host browser.
- Editor LSP and linter integration is editor-specific. The container provides
  the binaries; run `pnpm check` inside it or configure the editor to invoke
  `docker exec`.

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

## How it works

`content_example.code-workspace` is the entry point for users: it carries the
shared editor settings and extension recommendations. `.devcontainer` is a VS
Code convention, not a Docker feature. Docker builds and runs the container; VS
Code reads `devcontainer.json`, builds the `dev` target, creates the container,
installs its server inside it, and attaches the window. The workspace stays on
the host as a bind mount at `/workspaces/<repo>`.

### Lifecycle

| Stage               | When                                   | What happens                                                                                                            |
| ------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Image build         | on create or rebuild                   | `Dockerfile` target `dev` installs the toolchain: Node, pnpm, uv, Python, pinned `coasti-planner`, git/sudo, Ruff, mypy |
| Container creation  | once per container, also after rebuild | bind mount, named volumes, `REGISTRY_RO_TOKEN`, `init`, unprivileged remote user                                        |
| `postCreateCommand` | once per creation or rebuild           | chown volumes, write `~/.npmrc`, `pnpm install`, `config.dev.yml`, dummy DB                                             |
| VS Code attach      | after setup                            | server and remote extensions start in the container                                                                     |
| `postStartCommand`  | every start                            | `pnpm install --frozen-lockfile` re-sync                                                                                |
| Terminal            | on demand                              | `coasti-planner config.dev.yml`, `pnpm dev`                                                                             |

### Where things live

| Thing                                      | Host                              | Container                       |
| ------------------------------------------ | --------------------------------- | ------------------------------- |
| VS Code UI                                 | yes                               |                                 |
| VS Code Server, terminals, tasks, debugger |                                   | yes                             |
| basedpyright, Ruff, Oxc, TypeScript server |                                   | yes                             |
| Node, pnpm, `coasti-planner`, Ruff, mypy   |                                   | yes                             |
| `node_modules`, pnpm store                 |                                   | Docker volumes                  |
| Repository files                           | bind mount                        | visible at `/workspaces/<repo>` |
| Browser                                    | opens forwarded `localhost` ports | tunnels `8000` and `5174`       |

### Why the split

- **Image vs workspace.** The image is slow, stable, and built from this
  repository; it holds the toolchain, not the extension's dependencies. A
  `package.json` change should be a seconds-long `pnpm install`, not a rebuild.
- **Volumes.** The workspace is a bind mount, so the image cannot populate
  `<workspace>/node_modules`; `postCreate` installs into a named volume there.
  The volume keeps platform-specific binaries (TypeScript 7, oxlint, tsgolint)
  Linux-side. The pnpm store is a shared volume for hardlink deduplication.
- **Ownership.** Docker creates volume mount points as root. The container runs
  as an unprivileged remote user (VS Code aligns its UID with the host on
  Linux), so the `dev` stage installs passwordless `sudo` and `postCreate`
  chowns the volumes.
- **Secrets.** `REGISTRY_RO_TOKEN` enters the container at runtime; `~/.npmrc`
  references it by variable name, so the token is not in the image or repo.
- **Ports.** `forwardPorts` is the VS Code tunnel, not Docker port publishing.
  The browser resolves the backend's `dev_url` (`http://localhost:5174`) on the
  host, and VS Code forwards it into the container.
