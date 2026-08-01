FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV ASTRO_TELEMETRY_DISABLED=1
WORKDIR /app
# `corepack install` reads the packageManager field, so pnpm is fetched in its
# own layer instead of on first use inside the install step, where a slow
# registry round trip is paid before dependency resolution even starts.
RUN --mount=type=bind,source=package.json,target=package.json \
    corepack enable && corepack install

FROM base AS build
# Astro inlines import.meta.env at build time, so this has to reach `pnpm run
# build`, not the runtime image. Set it as a Coolify build variable.
ARG PLAUSIBLE_URL
ENV PLAUSIBLE_URL=$PLAUSIBLE_URL
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store
COPY . .
RUN pnpm run build

FROM nginx:alpine AS runtime
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
# Gives the orchestrator something to gate a rolling update on, instead of
# treating "container started" as "site is serving".
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:8080/ || exit 1
