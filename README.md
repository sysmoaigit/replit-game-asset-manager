# Game Asset Manager

Exported from Replit. Original project: [Game Asset Manager](https://replit.com/@aipremiumshop02/Game-Asset-Manager)

> ⚠️ **Replit project deleted** — This GitHub repo is now the canonical source of truth.

## What it is

A pnpm workspace monorepo containing:
- **selim-in-dhaka** — Mobile-first swipe decision web game (React + Vite + TypeScript + Tailwind CSS + framer-motion). PWA-capable, localStorage persistence.
- **api-server** — Express 5 API server with PostgreSQL + Drizzle ORM.
- **mockup-sandbox** — Vite + React UI component playground.

## Stack

- Node.js 24
- pnpm workspaces
- TypeScript 5.9
- React + Vite (frontend)
- Express 5 + Drizzle ORM (backend)
- PostgreSQL (database)

## Local run

```bash
# Install dependencies
pnpm install

# Typecheck all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Run API server
pnpm --filter @workspace/api-server run dev

# Run game dev server
pnpm --filter @workspace/selim-in-dhaka run dev
```

## Env keys required (names only)

- `AI_INTEGRATIONS_GEMINI_API_KEY`
- `LLM_API_KEY`
- `LOG_LEVEL`
- `PORT`
- `NODE_ENV`

## Auto-Deploy (CI/CD)

**Push to `main` → GitHub Actions builds → deploys to Cloudflare Pages automatically.**

| Workflow | Trigger | Deploy Target |
|----------|---------|---------------|
| `deploy-selim-in-dhaka.yml` | Push to `artifacts/selim-in-dhaka/**`, `lib/**`, `package.json` | https://selim-in-dhaka.pages.dev |
| `deploy-mockup-sandbox.yml` | Push to `artifacts/mockup-sandbox/**`, `lib/**`, `package.json` | https://mockup-sandbox.pages.dev |

**Manual trigger**: Go to GitHub → Actions → select workflow → "Run workflow"

**Build env vars** (set in GitHub Actions):
- `PORT=3000`
- `BASE_PATH=/`
- `NODE_ENV=production`

### Required GitHub Secret

- `CLOUDFLARE_API_TOKEN` — stored in repo Settings → Secrets and variables → Actions

## Manual Deploy (fallback)

```bash
# Build game
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/selim-in-dhaka run build

# Deploy game
npx wrangler pages deploy artifacts/selim-in-dhaka/dist/public --project-name=selim-in-dhaka

# Build mockup
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/mockup-sandbox run build

# Deploy mockup
npx wrangler pages deploy artifacts/mockup-sandbox/dist --project-name=mockup-sandbox
```

## API Server Deploy

**Status**: Not yet deployed. Requires PostgreSQL database.

Options:
1. **Supabase** free tier — migrate Drizzle ORM to Supabase connection string
2. **Cloudflare D1** — use `drizzle-orm/d1` adapter
3. **Neon/Render** free tier — standard Postgres host

## Rollback

Revert to last tagged release on GitHub and redeploy.

## License

MIT
