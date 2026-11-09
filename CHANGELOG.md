# Changelog

## 2026-11-08
- Created the initial AgentClinic project scaffold and ignored Claude Code worktrees
- Added the product specs (mission, tech stack, roadmap) and a dated Hello Hono feature spec with requirements, plan, and validation
- Implemented Phase 1: Hono server with `tsx` dev mode, a home page, static CSS, and a shared layout split into Header, Main, and Footer components
- Added Vitest route tests plus `typecheck` and `validate` npm scripts
- Required responsive, mobile-first design across the product specs, feature specs, CSS, and tests
- Implemented Phase 2: SQLite (`better-sqlite3`) with SQL migrations applied at startup, seeded agents and ailments, `/agents`, `/agents/:id`, and `/ailments` pages, nav links, and Pico CSS styling with small project overrides
- Replaced route tests with in-memory-database tests covering migrations, seeding, pages, 404s, and responsive markup
