# Example extension (content package)

## Run with Docker

Set `REGISTRY_RO_TOKEN` to a read-only Coasti npm-registry token, then build and
start from this repository. (temporary until fully public)

```powershell
# bash
export REGISTRY_RO_TOKEN="<read-only token>"

# powershell
$env:REGISTRY_RO_TOKEN = "<read-only token>"

docker compose -f docker/docker-compose.yaml build
docker compose -f docker/docker-compose.yaml up
```

- Visit `localhost:8000`

**Notes**

- The docker build installs Node, pnpm, and uv, and copies the entrypoint into
  the image.
- When started, Compose mounts this repo at `/app` and keeps `node_modules` and
  the pnpm store in a Docker volume.
- The entrypoint installs project dependencies, builds the extension into
  `dist/`, then starts the backend on port 8000.
- Rebuild the image after changing `docker/entrypoint.sh`.

## Run on Host

### Install

**Frontend**

Install node >= 24 and pnpm >= 11

```bash
pnpm config set "//git.linkfish.eu/api/packages/coasti/npm/:_authToken" "$REGISTRY_RO_TOKEN"
pnpm i
```

**Backend**

Install uv

```bash
uv tool install coasti_planner
```

Create dummy database

```bash
python ./scripts/generate_dummy_database.py
```

### Run

**from build dist**

```bash
pnpm build
coasti-planner ./config.example.yml
```

**WIP: development server**

```bash
# console 1
pnpm run dev

# console 2
coasti-planner ./config.example.yml --dev
```

visit `localhost:8000`
