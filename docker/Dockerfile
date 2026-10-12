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

COPY --chmod=755 docker/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
