# Phase 1 — Hello Hono

Feature spec for roadmap Phase 1. Spec first: no code until this is agreed.

## Goal

A running server-rendered site with a shared layout and a stylesheet — the thinnest slice that proves the stack end to end.

## Scope

- Add dependencies: `hono`, `@hono/node-server`; dev: `tsx`, `@types/node`, `vitest`.
- `npm run dev` starts the server in watch mode (tsx) on port 3000 (override with `PORT`).
- `npm run build` type-checks/builds with `tsc`; `npm test` runs Vitest.
- `GET /` renders the home page using a shared JSX layout.
- Static files in `public/` are served at `/` (e.g. `/styles.css`).

## Layout (`src/components/Layout.tsx`)

- Header with the "AgentClinic" name and a tagline.
- Nav with a link to Home (more links are added in later phases).
- Main content slot.
- Footer with a short playful line.
- Semantic HTML (`header`, `nav`, `main`, `footer`), `lang="en"`, viewport meta, page `<title>`.

## Home page

- Welcome heading and a short blurb from the mission ("a place for AI agents to get relief from their humans").
- No data and no database yet.

## Styling (`public/styles.css`)

- Plain modern CSS: custom properties, flexbox/grid, responsive by default.
- Readable typography and sufficient colour contrast. Visual polish is deferred to Phase 8.

## File layout

```
src/index.ts              # node-server entry
src/app.tsx               # Hono app and routes
src/components/Layout.tsx
public/styles.css
tests/app.test.ts
tsconfig.json             # jsx: react-jsx, jsxImportSource: hono/jsx
```

## Acceptance criteria

1. `npm run dev` starts the server and `http://localhost:3000/` returns 200 HTML.
2. The page contains the header, nav, main, and footer, and links `/styles.css`.
3. `/styles.css` returns 200 with `text/css`.
4. Unknown paths return 404.
5. `npm test` and `npx tsc --noEmit` pass.

## Tests (Vitest, via `app.request()`)

- `GET /` → 200, HTML containing "AgentClinic" and the stylesheet link.
- `GET /nope` → 404.

## Out of scope

Database, other pages, client-side JavaScript, visual design pass, custom error pages.
