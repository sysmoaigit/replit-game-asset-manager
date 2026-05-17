# Game Asset Manager

Exported from Replit. Original project: [Game Asset Manager](https://replit.com/@aipremiumshop02/Game-Asset-Manager)

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

## Deploy steps

- **Static game (selim-in-dhaka)**: Build with `pnpm --filter @workspace/selim-in-dhaka run build`, deploy `dist/public` to Cloudflare Pages.
- **API server**: Requires PostgreSQL. Can be deployed to Cloudflare Workers (Hono port) or any Node.js host with DB access.

## Rollback

Revert to last tagged release on GitHub and redeploy.

## License

MIT
