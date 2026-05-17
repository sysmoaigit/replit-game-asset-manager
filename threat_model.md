# Threat Model

## Project Overview

This workspace is a pnpm TypeScript monorepo. The production-relevant application is “Selim in Dhaka,” a React + Vite frontend game backed by an Express 5 API server. The game is mostly client-side state and localStorage persistence, with an optional public LLM chat endpoint that proxies player messages to Gemini/OpenAI/OpenRouter/Anthropic using server-side environment secrets. PostgreSQL/Drizzle libraries exist in the workspace but the current production API code does not expose database-backed business data.

Production assumptions: `NODE_ENV` is set to `production`; the Replit platform terminates TLS for deployed traffic; `artifacts/mockup-sandbox` is development-only and not considered production unless a production route or deployment explicitly serves it.

## Assets

- **LLM provider API keys and integration secrets** -- stored in environment variables and used by `artifacts/api-server/src/routes/selimChat.ts`. Misuse could incur cost, quota exhaustion, or access to provider capabilities through the application.
- **Player chat content and local memories** -- game memories live in browser localStorage. Only compressed context and player messages are intended to cross to the backend/LLM provider.
- **Application availability and provider quota** -- the public chat endpoint consumes backend CPU/network and paid/external LLM quota.
- **Application source and static assets** -- frontend code, generated clients, audio/image assets, and game content served to browsers.

## Trust Boundaries

- **Browser to Express API** -- requests to `/api/*` come from untrusted clients. The API must not trust frontend-only validation, client-supplied prompts, client-supplied headers, or OpenAPI documentation constraints unless enforced server-side.
- **Express API to LLM provider** -- the server sends prompts to third-party LLM APIs using privileged server-side API keys. The server must constrain what clients can cause it to send and must protect provider quota.
- **Browser localStorage to frontend code** -- local saves, memory, and chat logs can be modified by the user or corrupted. Frontend code must treat localStorage data as untrusted.
- **Development vs production artifacts** -- `artifacts/mockup-sandbox`, Vite dev plugins, and debug panels are out of production scope when gated by `NODE_ENV !== "production"` or not deployed.

## Scan Anchors

- Production API entry points: `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/routes/index.ts`, `artifacts/api-server/src/routes/selimChat.ts`, `artifacts/api-server/src/routes/health.ts`.
- Frontend LLM/chat client: `artifacts/selim-in-dhaka/src/ai/llmClient.ts`, `promptBuilder.ts`, `contextBudget.ts`, `responseParser.ts`, `memoryStore.ts`, and chat UI components under `artifacts/selim-in-dhaka/src/components/`.
- Public surfaces: `/api/healthz`, `/api/selim-chat/status`, `/api/selim-chat`, and static frontend routes/assets.
- Dev-only areas normally excluded: `artifacts/mockup-sandbox`, generated build output, `node_modules`, attached prompt/reference assets, and Vite dev server settings unless production reachability is shown.
- Highest-risk review areas: public LLM proxy input validation and quota protection, server-side enforcement of OpenAPI constraints, privacy boundary between local memories and remote LLM calls, and any future database/auth endpoints.

## Threat Categories

### Spoofing

The current app has no user accounts, so user impersonation risk is limited. However, client IP identity used for rate limiting is security-relevant: the API must derive caller identity from a trustworthy source rather than directly trusting user-controlled forwarding headers.

### Tampering

Frontend localStorage and API request bodies are fully user-controlled. The backend must validate required fields, enforce documented length limits, and construct privileged prompts server-side rather than trusting client-submitted `systemPrompt` or `userPrompt` values.

### Information Disclosure

The intended privacy contract is that raw local memories are not sent to the backend. Frontend code must preserve that contract, and the backend must avoid logging sensitive request bodies or secrets. Status endpoints should not expose secret values; exposing provider/model availability is lower risk but still production-visible metadata.

### Denial of Service

The public chat endpoint can consume external LLM quota and application resources. It requires robust, non-spoofable rate limiting, bounded request sizes/field lengths, timeouts on provider calls, and ideally origin/application-level abuse controls.

### Elevation of Privilege

There are no admin roles or authenticated privileges in the current production app. The primary privilege boundary is the server-side LLM API key: public clients must not be able to turn the server into an unrestricted LLM proxy or bypass safety/quota controls.