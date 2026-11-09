# Tech Stack

AgentClinic is a server-side TypeScript application. All rendering happens on the server; the browser receives plain HTML that works well and looks good.

## Core

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Type safety end-to-end; satisfies Mary's requirement |
| Runtime | Node.js | Stable, well-supported, vast ecosystem |
| Server framework | **Hono** | Lightweight, TypeScript-first, fast, excellent DX; routes and middleware feel natural |
| Templating | Hono JSX (server-side) | JSX without React overhead; components are just functions |
| CSS | [Pico CSS](https://picocss.com) v2 (pinned CDN link) + a small `public/styles.css` of overrides using CSS custom properties | Classless, semantic-HTML styling with responsive defaults and no build step; Steve gets a modern, attractive result. Needs internet access to load Pico; vendor it later if offline use matters |
| Responsive design | Mobile-first CSS (fluid widths, flexbox/grid, `min-width` media queries) + viewport meta tag | The web UI must work on phones, tablets, and desktops |

## Recommended: Hono

[Hono](https://hono.dev) is chosen over Express/Fastify because:

- First-class TypeScript with zero config
- Built-in JSX renderer for server-side HTML
- Middleware model is simple and composable
- Runs on Node, Deno, Bun, and edge runtimes without changes

## Data

- **SQLite** (via `better-sqlite3`) for local development and early production — simple, embedded, no infrastructure
- Migrations via plain SQL files; no ORM to start

## Testing

- **Vitest** — fast, TypeScript-native, compatible with the rest of the stack
- Vitest tests are how we validate features: each feature's `validation.md` criteria are covered by tests in `tests/` (Hono's `app.request()` makes route tests simple)
- npm scripts in `package.json`: `npm test` runs Vitest, `npm run typecheck` runs `tsc --noEmit`, and `npm run validate` runs both

## Tooling

- `tsx` for development (run TypeScript directly, no build step needed)
- `tsc` for production builds
- `prettier` for formatting

## What We Are Not Using

- No React, Vue, or Svelte — server-side rendering keeps the stack simple
- No ORM — SQL is sufficient at this scale
- No Docker — not yet; that's a later phase concern
