# Build context must be the monorepo root:
#   docker build -f apps/web/Dockerfile --build-arg VITE_API_URL=https://api.example.com .
#
# VITE_API_URL is inlined into the JS bundle at build time (Vite env vars
# aren't readable at container runtime) — the image has to be rebuilt to
# point at a different API URL.

FROM node:22-alpine AS base
RUN corepack enable

# ---- Prune the monorepo down to just what `web` needs ----
FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune web --docker

# ---- Install (cached unless web's actual deps change) + build ----
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm turbo build --filter=web

# ---- Runtime: static files only, no Node ----
FROM nginx:alpine AS runner
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
