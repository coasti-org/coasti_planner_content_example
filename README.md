# Example extension (content package)

Build the extension with `pnpm build`, then start the backend from the
repository root using [config.example.yml](config.example.yml):

`uv run --directory backend coasti-planner ../cp_example_extension/config.example.yml`

The example configuration serves the framework and extension `dist` folders
locally. Both paths are resolved relative to the configuration file.
