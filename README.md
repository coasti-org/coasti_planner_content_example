# Example extension (content package)

Build the extension with `pnpm build`, then start the backend from the
repository root using [config.example.yml](config.example.yml):

`uv run --directory backend coasti-planner ../cp_example_extension/config.example.yml`

The example configuration serves the framework and extension `dist` folders
locally. Both paths are resolved relative to the configuration file.


# Install

*Frontend*

Install node >= 24 and pnpm >= 11

```bash
pnpm config set "//git.linkfish.eu/api/packages/coasti/npm/:_authToken" "$REGISTRY_RO_TOKEN"
pnpm i
```

*Backend*

Install uv

```bash
uv tool install coasti_planner
```

Create dummy database

```bash
python ./scripts/generate_dummy_database.py
```

# Run

*from build dist*

```bash
pnpm build
coasti-planner ./config.example.yml
```

*WIP: development server*

```bash
# console 1
pnpm run dev

# console 2
coasti-planner ./config.example.yml --dev
```

visit `localhost:8000`
