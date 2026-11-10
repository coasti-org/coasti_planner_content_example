# Example extension (content package)

Example content package for the Coasti Planner: a React extension in `src/` and
Python models in `tables/`, `filters/`, `actions/`, and `outlets/`.

## Run in Docker

The recommended setup is the VS Code dev container.

1. Install Docker and the VS Code Dev Containers extension.
2. Copy `.env.example` to `.env` in the repository root and fill in the
   read-only registry token; see
   [`docker/README.md`](docker/README.md#prerequisites).
3. Open [`content_example.code-workspace`](content_example.code-workspace) and
   run **Dev Containers: Open Workspace in Container...**.

Once attached, start the backend and the extension in two terminals:

```bash
# terminal 1
coasti-planner config.dev.yml

# terminal 2
pnpm dev
```

Open `http://localhost:8000`. See [`docker/README.md`](docker/README.md) for the
production compose file, checks, and container details.

## Run on Host

Open [`content_example.code-workspace`](content_example.code-workspace) for the
same editor settings. The dev container supplies the Python interpreter; on the
host, select `.venv/bin/python` if the Python extension does not discover it.

### Install

**Frontend**

Install node >= 24 and pnpm >= 11. A read-only registry token is required until
the `@coasti` packages are public; see
[`docker/README.md`](docker/README.md#prerequisites). Export it before
installing:

```bash
export REGISTRY_RO_TOKEN="$(sed -n 's/^REGISTRY_RO_TOKEN=//p' .env | tail -n 1)"
pnpm config set "//git.linkfish.eu/api/packages/coasti/npm/:_authToken" "$REGISTRY_RO_TOKEN"
pnpm install
```

**Backend**

Install uv and create one environment containing the framework and the checks,
so mypy can resolve the framework types:

```bash
uv venv .venv
uv pip install --python .venv/bin/python \
  coasti-planner==0.2.3 ruff==0.16.9 mypy==2.3.1
source .venv/bin/activate
```

Generate the dummy database:

```bash
python ./scripts/generate_dummy_database.py
```

### Configs

The backend is always started with a runtime config. Keep it in this directory
(the extension root): relative paths such as `extensions[].path` and `database`
resolve against the config file. Start the backend with `config.dev.example.yml`
/ `config.prod.example.yml` directly, or copy one to keep local settings:

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
