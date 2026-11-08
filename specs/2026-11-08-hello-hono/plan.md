# Hello Hono — Plan

## Group 1 — Setup

1. Install `hono` and `@hono/node-server`; install dev deps `tsx`, `@types/node`, `vitest`.
2. Update `tsconfig.json` (NodeNext, `jsx: react-jsx`, `jsxImportSource: hono/jsx`, strict) and `package.json` scripts (`dev`, `start`, `test`, `typecheck`).

## Group 2 — Server

3. Layout components in `src/components/`: `Header.tsx` (brand, tagline, nav), `Main.tsx` (content slot) and `Footer.tsx` as three subcomponents, composed by `Layout.tsx`, which also links `/styles.css` in `<head>`.
4. `src/app.tsx`: Hono app, static serving from `public/`, `GET /` home page.
5. `src/index.ts`: node-server entry reading `PORT`.

## Group 3 — Styling and tests

6. `public/styles.css`: custom properties, mobile-first responsive layout (small-screen base styles, `min-width` media queries for larger screens), readable contrast.
7. `tests/app.test.ts` and `vitest.config.ts`: route tests via `app.request()`, including viewport meta and responsive CSS checks.

## Group 4 — Verify

8. Run `npm run typecheck` — must exit 0 with no errors.
9. Run `npm test` — all tests pass.
10. Run `npm run dev` and confirm `curl localhost:3000` returns the home page HTML.
