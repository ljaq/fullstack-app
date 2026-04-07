# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Development
pnpm dev                    # Start Vite + Hono dev server (development mode)
pnpm dev:production         # Start dev server in production mode

# Building
pnpm build                  # Clean and build both client and server
pnpm build:client           # Build multi-page frontend (outputs to build/public/)
pnpm build:server           # Build server entry (outputs to build/app.js)

# Production
pnpm start:test             # Run production build with development env
pnpm start:prod             # Run production build with production env

# Database & Utilities
pnpm seed                   # Seed database with test data (tsx scripts/seed.ts)
pnpm db:init                # Initialize Turso/libsql database
pnpm generate               # Run code generation scripts
```

## Architecture Overview

This is a **unified fullstack monorepo** using Vite 8 as the single toolchain for both frontend and backend development.

### Key Design Principles

1. **Single Entry Point**: Root `app.ts` serves as the HTTP entry point, mounting Hono routes, multi-page HTML templates, static assets, and `/api/*` proxy in one process during development.

2. **Dual HTTP Namespaces**:
   - `/jaq/*` — Custom business APIs from `server/routes/` (auto-scanned file routes)
   - `/api/*` — Proxied to `VITE_THIRD_API` for third-party services

3. **End-to-End Type Safety**: `app.ts` exports `AppType` which is consumed by `api/index.ts` to create a type-aligned request client. This means `request.jaq.auth.login.post()` corresponds exactly to the backend route at `/jaq/auth/login`.

4. **File-Based Routing**:
   - Backend: `server/routes/**/*.ts` → HTTP routes via `vite-plugin-server-route`
   - Frontend: `client/pages/<page>/routes/**/*.tsx` → React Router routes via `vite-plugin-client-route`

### Directory Structure

```
├── app.ts                          # HTTP entry point: routes, HTML, static, proxy
├── server/
│   ├── routes/                     # File-based backend routes (base: /jaq)
│   │   ├── **/xxx.service.ts       # Domain logic (excluded from route scanning)
│   │   ├── **/xxx.schema.ts        # Zod schemas (excluded from route scanning)
│   │   └── **/xxx.snapshot.ts      # Dev API snapshots (excluded from route scanning)
│   ├── entities/                   # TypeORM entities
│   ├── db.ts                       # Database connection
│   └── utils/                      # Shared utilities (auth, zod-validator, etc.)
├── client/
│   └── pages/                      # Multi-page apps (each is an independent SPA)
│       └── <page>/                 # e.g., cms, login, 404
│           ├── index.html          # Page entry point
│           ├── main.tsx            # React bootstrap
│           ├── App.tsx             # Root component
│           └── routes/             # File-based frontend routes
├── api/                            # Type-safe API client
│   ├── api.ts                      # URL tree (mirrors backend structure)
│   └── index.ts                    # createApiProxy for request chaining
├── types/                          # Shared TypeScript types
└── utils/                          # Shared utilities
```

## Backend Development

### File Route Conventions

Routes are **auto-generated** from `server/routes/**/*.ts` via `vite-plugin-server-route`. Do **not** manually edit `_route.gen.ts`.

**Route Handler Pattern:**
```ts
// server/routes/feature/action.ts
import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { actionBody } from './action.schema'

const factory = createFactory()

export const POST = factory.createHandlers(
  requireAuth,              // Optional: auth middleware
  zValidator('json', actionBody),  // Request validation
  async c => {
    const data = c.req.valid('json')
    // Call service layer for business logic
    return c.json(result)
  }
)
```

**Dynamic segments:** Use `[id].ts` for `/jaq/feature/:id`

**Service Layer:** Place business logic in `*.service.ts` (same directory, same stem). Route handlers should be thin: authentication, validation, service call, HTTP response.

**Middleware & Auth:**
- `requireAuth` — Protected route middleware (from `server/utils/auth.ts`)
- `getCurrentUser(c)` — Get authenticated user
- `setAuthCookie(c, { userId })` — Set authentication cookie
- `verifyPassword`, `hashPassword` — Password utilities

### Validation

Use `server/utils/zod-validator` with Zod schemas in `*.schema.ts` files. Validation failures return `{ message, issues }` structure for frontend form display.

## Frontend Development

### Multi-Page Apps

Each page in `client/pages/<page>/` is an independent SPA:
- Development: Access at `http://localhost:PORT/<page>/*`
- Production: Served from `build/public/`

### File Routes

Frontend routes are generated from `client/pages/<page>/routes/**/*.tsx` via `vite-plugin-client-route`. Do **not** manually edit `_route.gen.ts`.

**Route Config Pattern:**
```tsx
// routes/list/index.config.tsx
export const meta = { title: 'List', keepAlive: true }
export const loader = async () => { /* data loading */ }
export const searchSchema = { /* form-render schema */ }
```

### API Client

Use the type-safe `request` proxy for chain-style API calls:
```ts
import { request } from 'api'

// POST with body
await request.jaq.auth.login.post({ body: { username, password } })

// GET with query
await request.jaq.roles.index.get({ query: { page: 1, pageSize: 10 } })

// Dynamic params
await request.jaq.users.id({ id: '123' }).get()
```

**Third-party APIs:** Use `authority` namespace (proxied to `/api/*`):
```ts
await request.authority.login.post({ body: {...} })
```

**Low-level Fetch:** For non-tree requests, use `Fetch` from `api/fetch.ts`:
```ts
import { Fetch } from 'api'
await Fetch({ url: '/custom', method: 'POST', body: {...} })
```

## Environment Variables

- Uses `.env.${mode}` files (development, production, etc.)
- Server mode: `process.env.mode` (from NODE)
- Client mode: `import.meta.env.MODE`
- Key variables: `VITE_PORT`, `VITE_THIRD_API`, `AUTH_SECRET`, `VITE_SSL_*`

## Path Aliases

TypeScript `baseUrl: "."` with aliases: `api`, `client`, `server`, `utils`, `types`, `core`.
