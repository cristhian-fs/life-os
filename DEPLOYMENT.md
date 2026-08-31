# Deployment

Two separate images — `apps/api` (Node, long-running) and `apps/web` (static
SPA, served by nginx). Both Dockerfiles use `turbo prune` and must be built
with the **monorepo root as build context**:

```sh
docker build -f apps/api/Dockerfile -t life-os-api .
docker build -f apps/web/Dockerfile --build-arg VITE_API_URL=https://api.yourdomain.com -t life-os-web .
```

## Dokploy

One Dokploy "Compose" application pointing at `docker-compose.prod.yml`.
Set these in Dokploy's Environment panel for the app:

| Var | Notes |
|---|---|
| `DATABASE_URL` | Dokploy's managed Postgres connection string |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://api.yourdomain.com` |
| `CORS_ORIGIN` | `https://app.yourdomain.com` |
| `VITE_API_URL` | `https://api.yourdomain.com` — also passed as a **build arg** to `web` (Vite inlines it at build time, not runtime — changing it means redeploying `web`, not just restarting it) |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_BUCKET_NAME` / `AWS_ENDPOINT` | Real R2/S3 credentials — not the dev MinIO in `docker-compose.yml` |
| `AWS_PUBLIC_URL` | Optional — public base URL for uploaded files, if different from `AWS_ENDPOINT` |
| `LOG_LEVEL` | Optional, defaults to `info` |

Assign a domain to each of `api` and `web` in Dokploy's UI — it wires up
Traefik/SSL automatically, no labels needed in the compose file. Two
subdomains (`app.yourdomain.com` + `api.yourdomain.com`) is simplest; a
shared domain with path-based routing works too but needs its own proxy
rule Dokploy doesn't set up for you.

Migrations run automatically as part of the `api` container's start command
(`migration:run` against the compiled `dist/db/data-source.js`, then
`node dist/index.js`) — fine for a single instance; don't scale `api` to
multiple replicas without moving migrations to a separate deploy step first
(concurrent replicas would race to run the same migration).

## What's not self-hosted here

- **Postgres** — assumed managed (Dokploy's own, or any external instance).
  `docker-compose.yml` at the repo root only has dev infra (Postgres +
  MinIO) and isn't used in production.
- **Object storage** — MinIO in `docker-compose.yml` is dev-only; production
  points `AWS_*` at real Cloudflare R2 (or any S3-compatible service).
