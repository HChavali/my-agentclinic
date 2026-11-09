# Hello Hono — Requirements

Roadmap Phase 1. Spec first: this folder is agreed before code changes.

## Scope

- Add `hono` and `@hono/node-server`; dev dependencies `tsx`, `@types/node`, `vitest`.
- `npm run dev` starts the server in watch mode (tsx) on port 3000 (override with `PORT`).
- `GET /` renders a home page using a shared `Layout` composed of three subcomponents: `Header`, `Main`, `Footer`.
- Static files in `public/` are served at `/` (a basic `styles.css`).
- Unknown paths return 404.
- The UI is responsive and mobile-first: usable from ~320px phone widths up to wide desktop screens, with no horizontal scrolling.

## Out of scope

Database, other pages, client-side JavaScript, visual design pass, custom error pages.

## Decisions

- TypeScript `strict: true`; JSX via `hono/jsx` (`jsxImportSource`).
- ESM (`"type": "module"`, NodeNext resolution).
- Vitest limited to `tests/**` so stray worktree tests are not picked up.
- Plain modern CSS, mobile-first: base styles target small screens and `min-width` media queries enhance for larger ones.
- Responsive design is a product-wide requirement (see `specs/mission.md`); visual polish is deferred to a later phase.

## Context

- Mission and stack: `specs/mission.md`, `specs/tech-stack.md`; order: `specs/roadmap.md`.
- Audience: students of the spec-driven development course, so keep code small and readable.

## Stakeholder notes

- Mary (engineering): reliable, popular TypeScript stack.
- Steve (marketing): attractive, modern-browser friendly — responsive from the start, polish later.
- Susan (product): feature pages arrive in later phases.
