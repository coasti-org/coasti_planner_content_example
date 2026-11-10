# syntax=docker/dockerfile:1.7

FROM ghcr.io/astral-sh/uv:0.11.28 AS uv

# Shared toolchain for production, the dev container, and CI. The framework
# release is installed into a world-readable venv so it can be used by both
# root (compose) and the non-root dev-container user.
FROM node:24-bookworm-slim AS base

ARG COASTI_VERSION=0.2.3
ARG PNPM_VERSION=11.27.0

ENV PATH="/opt/coasti/venv/bin:${PATH}" \
    UV_PYTHON_INSTALL_DIR="/opt/uv/python" \
    LANG=C.UTF-8 \
    PYTHONUTF8=1

COPY --from=uv /uv /uvx /bin/

WORKDIR /app

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global pnpm@${PNPM_VERSION} \
    && uv python install 3.13 \
    && uv venv /opt/coasti/venv --python 3.13 \
    && uv pip install --python /opt/coasti/venv/bin/python \
        "coasti-planner==${COASTI_VERSION}" \
    && chmod -R a+rX /opt/coasti /opt/uv

FROM base AS prod

COPY --chmod=755 docker/entrypoint.prod.sh /

ENTRYPOINT ["/entrypoint.prod.sh"]

# Editor toolchain for the dev container. Language servers themselves are VS
# Code extensions; only the binaries they invoke are installed here, at the
# versions pinned by the framework's lockfile.
FROM base AS dev

ARG RUFF_VERSION=0.16.9
ARG MYPY_VERSION=2.3.1

# The touch is a stopgap until the coasti-planner wheel ships the PEP 561
# marker. Without it mypy treats the installed framework as untyped and strict
# mode fails with import-untyped. Remove once COASTI_VERSION includes py.typed.
RUN apt-get update \
    && apt-get install --yes --no-install-recommends git curl sudo \
    && rm -rf /var/lib/apt/lists/* \
    && echo 'node ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node \
    && uv pip install --python /opt/coasti/venv/bin/python \
        "ruff==${RUFF_VERSION}" \
        "mypy==${MYPY_VERSION}" \
    && touch /opt/coasti/venv/lib/python3.13/site-packages/coasti_planner/py.typed \
    && chmod -R a+rX /opt/coasti
