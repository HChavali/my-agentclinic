# Foundation: Layout, Agents, Ailments — Requirements

Roadmap Phase 2. Spec first: this folder is agreed before code changes.

## Scope

- Shared server-side JSX layout (header, nav, main, footer) with viewport meta; all routes render inside it (largely in place from Phase 1; nav gains Agents and Ailments links).
- Styling with **Pico CSS** (v2, loaded from a pinned CDN link) for reset, typography, and responsive defaults; `public/styles.css` holds only small project overrides using Pico's custom properties.
- SQLite via `better-sqlite3` with plain SQL migrations applied at startup by a small runner.
- Tables: `agents` (id, name, model_type, status), `ailments` (id, name, description), `agent_ailments` (agent_id, ailment_id) many-to-many.
- Seed data: a handful of fictional agents and ailments, with links between them.
- `/agents` lists all agents; `/agents/:id` shows name, model type, current status, and presenting complaints (linked ailments).
- `/ailments` lists all ailments.
- Unknown or non-numeric agent ids return 404.
- Every page is responsive (Pico's fluid `container` plus semantic HTML): usable from ~320px up to wide screens, no horizontal scrolling.

## Out of scope

Therapies, appointments, dashboard, create/edit forms, ailment detail page, custom error pages, auth, visual polish pass.

## Decisions

- Kept as one phase (not split into layout/DB sub-phases).
- Migrations are `migrations/*.sql` files run automatically at startup; no ORM, no separate migrate script.
- Pico CSS replaces hand-written base CSS; pages stick to semantic HTML so Pico styles them without extra classes. This supersedes plain-CSS-only in `tech-stack.md`; update it when this merges.
- Status is a fixed set: `available`, `in-session`, `needs-rest`.
- DB file lives at `data/agentclinic.db` (git-ignored); tests use `:memory:`.
- `createApp(db)` takes the database so tests can inject an in-memory one.
- Seeding is idempotent and only runs when tables are empty.

## Context

- Mission and stack: `specs/mission.md`, `specs/tech-stack.md`; order: `specs/roadmap.md`.
- Builds on `specs/2026-11-08-hello-hono`.
- Audience: course students, so keep code small and readable.

## Stakeholder notes

- Mary (engineering): reliable stack, SQL without an ORM.
- Steve (marketing): responsive and attractive; polish comes later.
- Susan (product): agent and ailment pages are the first real content.
