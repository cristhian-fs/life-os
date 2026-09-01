# Build context must be the monorepo root (turbo prune needs the whole
# workspace to compute what `api` actually depends on):
#   docker build -f apps/api/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable

# ---- Prune the monorepo down to just what `api` needs ----
FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune api --docker

# ---- Install (cached unless api's actual deps change) + build ----
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=api

# ---- Runtime ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=installer /app .
WORKDIR /app/apps/api

EXPOSE 9999
# Runs pending migrations against the compiled data source, then starts the
# server — fine for a single instance; don't do this with multiple api
# replicas (migration race).
CMD ["sh", "-c", "node node_modules/typeorm/cli.js migration:run -d dist/db/data-source.js && node dist/index.js"]
