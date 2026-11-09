# Foundation: Layout, Agents, Ailments — Plan

## Group 1 — Database setup

1. Install `better-sqlite3` and `@types/better-sqlite3`; add `data/` to `.gitignore`.
2. `src/db.ts`: `openDb(path)` opens SQLite (`data/agentclinic.db`, or `:memory:`), enables foreign keys, runs migrations and seeds; exports a default connection for the app.
3. `src/migrate.ts`: tiny runner that applies `migrations/*.sql` in filename order, tracking applied files in a `schema_migrations` table.
4. `migrations/001_agents.sql`, `002_ailments.sql` (`ailments` + `agent_ailments` join).

## Group 2 — Seed data

5. `src/seed.ts`: if tables are empty, insert ~6 fictional agents, ~6 ailments (e.g. "context-window claustrophobia", "prompt fatigue") and agent-ailment links. Idempotent.

## Group 3 — Layout and CSS

6. Update `Header.tsx` nav: Home, Agents, Ailments. Confirm viewport meta stays in `Layout.tsx`.
7. Add Pico CSS v2 (pinned, via jsdelivr CDN `<link>`) to `Layout.tsx` before `/styles.css`; use its semantic-HTML styling (`<main class="container">`, `<article>` cards, `<nav>`, `<table>`/lists).
8. Trim `public/styles.css` to small project overrides only (status badges, brand tweaks via Pico's `--pico-*` custom properties); no reset or typography of our own.

## Group 4 — Agents

9. `src/queries/agents.ts`: `listAgents(db)`, `getAgent(db, id)` (with its ailments).
10. Routes in `src/app.tsx` (app becomes `createApp(db)`): `GET /agents` list, `GET /agents/:id` profile (name, model type, status, presenting complaints); non-numeric or unknown id → 404.

## Group 5 — Ailments

11. `src/queries/ailments.ts`: `listAilments(db)`.
12. `GET /ailments` list page; each ailment shows its name and description. Agent profiles link complaints to `/ailments`.

## Group 6 — Tests and verify

13. `tests/` with an in-memory DB per test: migrations, seed, `/agents`, `/agents/:id`, 404s, `/ailments`, nav links, viewport meta, Pico stylesheet link, override CSS.
14. Run `npm run validate` — typecheck and tests must pass.
15. Run `npm run dev`, confirm the pages with `curl`, and update `CHANGELOG.md`.
