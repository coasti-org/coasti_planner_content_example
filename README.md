# Example extension (content package)

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

- The image installs Node, pnpm, uv, and the pinned `coasti-planner` 0.2.2
  release, which bundles both the production and the development framework
  assets.
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

Install uv:

```bash
uv tool install coasti-planner
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
