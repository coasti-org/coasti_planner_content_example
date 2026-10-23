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

- The image installs Node, pnpm, uv, and the latest `coasti-planner` release,
  which bundles both the production and the development framework assets.
- Compose mounts this repository at `/app` and keeps `node_modules` and the pnpm
  store in Docker volumes.
- Rebuild the image after changing `docker/entrypoint.prod.sh` or
  `docker/entrypoint.dev.sh`.

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
