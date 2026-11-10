# Example extension (content package)

Example content package for the Coasti Planner: a React extension in `src/` and
Python models in `tables/`, `filters/`, `actions/`, and `outlets/`.

## Getting started

The recommended environment is the VS Code dev container, which runs the
toolchain, the language servers, and the app inside Docker. See
[`docker/README.md`](docker/README.md) for the dev container, compose files, and
the checks it provides.

## Run on Host

### Install

**Frontend**

Install node >= 24 and pnpm >= 11. A read-only registry token is required until
the `@coasti` packages are public; see
[`docker/README.md`](docker/README.md#prerequisites).

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
