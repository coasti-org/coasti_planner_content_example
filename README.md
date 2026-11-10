# Example extension (content package)

## Dev container (recommended)

The repository ships `.devcontainer/`, so VS Code runs the toolchain, the
language servers, and the app inside a container.

**Prerequisites**

- Docker (Docker Desktop or a compatible engine).
- VS Code with the Dev Containers extension.
- A read-only Coasti npm-registry token in `REGISTRY_RO_TOKEN` in the **host**
  environment (temporary until the packages are fully public). Set it before
  starting VS Code, or restart VS Code after changing it:

```bash
export REGISTRY_RO_TOKEN="<read-only token>"
```

Open this folder in VS Code and run **Dev Containers: Reopen in Container**. The
first start builds the image and installs dependencies into Docker volumes; this
takes a few minutes. The post-create script also copies `config.dev.example.yml`
to `config.dev.yml` when it is missing.

**Run the app**

Use two integrated terminals, or the `dev:backend` / `dev:extension` tasks:

```bash
# terminal 1
coasti-planner config.dev.yml

# terminal 2
pnpm dev
```

Open `http://localhost:8000`. Ports `8000` and `5174` are forwarded
automatically.

**Checks**

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

## Run with Docker

Two compose files live in `docker/`:

- `docker-compose.prod.yaml` builds the extension and serves the production
  bundle from the backend.
- `docker-compose.dev.yaml` runs the backend with model hot reload and the
  extension's Vite dev server.

Both need a read-only Coasti npm-registry token in `REGISTRY_RO_TOKEN`
(temporary until the packages are fully public).

```bash
# bash
export REGISTRY_RO_TOKEN="<read-only token>"

# powershell
$env:REGISTRY_RO_TOKEN = "<read-only token>"
```

### Production

```bash
docker compose -f docker/docker-compose.prod.yaml up --build
```

Open `http://localhost:8000`.

### Development

```bash
docker compose -f docker/docker-compose.dev.yaml up --build
```

Open `http://localhost:8000`. The backend reloads the extension's pydantic
models, and the frontend hot-reloads from the Vite server on port `5174`.

**Notes**

- `docker/Dockerfile` has `base`, `prod`, and `dev` stages. The compose files
  use the `prod` stage; the VS Code dev container uses the `dev` stage, which
  adds git, sudo, Ruff, and mypy on top of the shared runtime toolchain.
- The image installs Node, pnpm, uv, and the pinned `coasti-planner` 0.2.2
  release, which bundles both the production and the development framework
  assets. The pin must expose the model API this extension uses; bump
  `COASTI_VERSION` in `docker/Dockerfile` once a framework branch with
  unreleased changes is published.
- Compose mounts this repository at `/app` and keeps `node_modules` and the pnpm
  store in Docker volumes.
- Rebuild the image after changing `docker/entrypoint.prod.sh` or
  `docker/entrypoint.dev.sh`.
- If pnpm reports an incompatible `node_modules` volume (for example
  `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`), the entrypoints recover by
  purging it automatically. To start from a clean slate instead, remove the
  volumes with `docker compose -f docker/docker-compose.prod.yaml down -v`.

## Run on Host

### Install

**Frontend**

Install node >= 24 and pnpm >= 11:

```bash
pnpm config set "//git.linkfish.eu/api/packages/coasti/npm/:_authToken" "$REGISTRY_RO_TOKEN"
pnpm install
```

**Backend**

Install uv and create one environment containing the framework and the checks,
so mypy can resolve the framework types:

```bash
uv venv .venv
uv pip install --python .venv/bin/python \
  coasti-planner==0.2.2 ruff==0.16.9 mypy==2.3.1
source .venv/bin/activate
```

Generate the dummy database:

```bash
python ./scripts/generate_dummy_database.py
```

### Configs

The backend is always started with a runtime config. Keep it in this directory
(the extension root): relative paths such as `extensions[].path` and `database`
resolve against the config file. The compose files pass
`config.prod.example.yml` / `config.dev.example.yml` directly; copy and edit one
to use your own settings, then point the backend (or the compose `entrypoint`)
at the copy:

```bash
cp config.dev.example.yml config.dev.yml
```

### Run

**Production (serves the prebuilt extension)**

```bash
pnpm build
coasti-planner config.prod.example.yml
```

**Development (backend reload + Vite dev server)**

```bash
# terminal 1
coasti-planner config.dev.example.yml

# terminal 2
pnpm dev
```

Visit `localhost:8000`; the extension hot-reloads from `http://localhost:5174`.

## Development users

The backend seeds these accounts the first time it starts against an empty meta
database (`data/coasti_planner.sqlite`). The password is always the username;
they exist to exercise roles and cell permissions and must not be used outside
local development.

| Username     | Password     | Roles                             |
| ------------ | ------------ | --------------------------------- |
| `admin`      | `admin`      | `admin` (framework), `controller` |
| `bearbeiter` | `bearbeiter` | `bearbeiter`                      |
| `politiker`  | `politiker`  | `politiker`                       |

The `bearbeiter`, `controller`, and `politiker` roles belong to this example
extension and are used by `tables/dummy_table.py`: a user may edit a `betrag` or
`is_active` cell only when the row's `can_edit_roles` column contains one of
their roles and the row is in `draft` status. The framework-owned `admin` role
stays internal and is not exposed to extensions.

Seeding only runs while the users table is empty. Delete the meta database (or
its Docker volume) to seed again. The accounts are hardcoded in the framework's
`coasti_planner/db/seed.py` until user management exists.
