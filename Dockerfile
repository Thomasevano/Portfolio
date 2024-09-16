FROM node:lts-slim AS base
ENV PNPM_HOME="/pnpm"
RUN corepack enable
WORKDIR /app
COPY package*.json ./
COPY . .

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# RUN  --mount=type=secret,id=plausible_url \
#   echo "PLAUSIBLE_URL=$(cat /run/secrets/plausible_url)" >> .env.production

RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

FROM nginx:alpine AS runtime
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080