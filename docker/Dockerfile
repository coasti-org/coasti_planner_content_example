# syntax=docker/dockerfile:1.7

FROM ghcr.io/astral-sh/uv:latest AS uv-builder

FROM node:24-bookworm-slim

COPY --from=uv-builder /uv /uvx /bin/

ENV PATH="/root/.local/bin:${PATH}"
ENV UV_PYTHON_INSTALL_DIR="/opt/uv/python"

WORKDIR /app

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global pnpm@11.27.0

# Pinned to the framework version this extension targets. The release bundles
# both the production and the development (assets-dev) SPA builds, so the image
# can serve either mode.
RUN uv python install 3.13 \
    && uv tool install coasti-planner==0.2.2 --python 3.13

COPY --chmod=755 docker/entrypoint.prod.sh docker/entrypoint.dev.sh /

ENTRYPOINT ["/entrypoint.prod.sh"]
