# Hello Hono — Requirements

Roadmap Phase 1. Spec first: this folder is agreed before code changes.

## Scope

- Add `hono` and `@hono/node-server`; dev dependencies `tsx`, `@types/node`, `vitest`.
- `npm run dev` starts the server in watch mode (tsx) on port 3000 (override with `PORT`).
- `GET /` renders a home page using a shared `Layout` composed of three subcomponents: `Header`, `Main`, `Footer`.
- Static files in `public/` are served at `/` (a basic `styles.css`).
- Unknown paths return 404.

## Out of scope

Database, other pages, client-side JavaScript, visual design pass, custom error pages.

## Decisions

- TypeScript `strict: true`; JSX via `hono/jsx` (`jsxImportSource`).
- ESM (`"type": "module"`, NodeNext resolution).
- Vitest limited to `tests/**` so stray worktree tests are not picked up.
- Plain modern CSS; polish is deferred to Phase 8.

## Context

- Mission and stack: `specs/mission.md`, `specs/tech-stack.md`; order: `specs/roadmap.md`.
- Audience: students of the spec-driven development course, so keep code small and readable.

## Stakeholder notes

- Mary (engineering): reliable, popular TypeScript stack.
- Steve (marketing): attractive, modern-browser friendly — basic responsive CSS now, polish later.
- Susan (product): feature pages arrive in later phases.
