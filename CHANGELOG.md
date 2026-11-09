# Changelog

## 2026-11-08
- Created the initial AgentClinic project scaffold and ignored Claude Code worktrees
- Added the product specs (mission, tech stack, roadmap) and a dated Hello Hono feature spec with requirements, plan, and validation
- Implemented Phase 1: Hono server with `tsx` dev mode, a home page, static CSS, and a shared layout split into Header, Main, and Footer components
- Added Vitest route tests plus `typecheck` and `validate` npm scripts
- Required responsive, mobile-first design across the product specs, feature specs, CSS, and tests
- Implemented Phase 2: SQLite (`better-sqlite3`) with SQL migrations applied at startup, seeded agents and ailments, `/agents`, `/agents/:id`, and `/ailments` pages, nav links, and Pico CSS styling with small project overrides
- Replaced route tests with in-memory-database tests covering migrations, seeding, pages, 404s, and responsive markup
- Addressed Phase 2 review findings: added the HTML doctype, aligned header and footer with Pico's container, added a StatusBadge with readable labels, linked complaints to ailment anchors, made agent names unique, made seeding race-safe, stronger tests, and updated tech-stack and roadmap for Pico CSS
- Merged roadmap phases 2-5 into a new Phase 2 (foundation, agents, ailments) and added a `changelog` skill for updating this file
- Added the dated Phase 2 feature spec (plan, requirements, validation) covering SQLite, agents and ailments pages, and Pico CSS styling
- Added the dated MVP spec (plan, requirements, validation) covering therapies, appointment booking, the staff dashboard, and Phase 7 essentials
- Implemented the MVP: therapies catalog with ailment-to-therapy recommendations, seeded therapists, an appointment booking form with server-side validation and confirmation page, and a staff dashboard with counts, tables, and appointment status updates
- Added custom 404 and 500 pages, request logging, and an end-to-end flow test alongside per-feature tests
