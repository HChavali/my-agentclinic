# MVP — Requirements

Roadmap Phases 3, 4, 5, and the essentials of Phase 7. Spec first: this folder is agreed before code changes. Together with the foundation phase, this is the first complete, demo-able AgentClinic: an agent can be matched to therapies and booked with a therapist, and staff can see and manage it all.

## Scope

- **Therapies:** `therapies` table with seed data, `/therapies` list page, and an ailment-to-therapy mapping. Recommended therapies are shown on `/ailments` and on an agent's profile.
- **Therapists:** a small seeded `therapists` table (name, specialty) used only by the booking form. No therapist pages.
- **Booking:** `appointments` table (agent, therapist, datetime, status, optional notes). A booking form on `/agents/:id/book`, server-side validation, and a confirmation page at `/appointments/:id`.
- **Dashboard:** `/dashboard` with summary counts (agents, open appointments, ailments in flight), tables of agents, appointments, and ailments, and staff can mark a `scheduled` appointment `completed` or `cancelled`.
- **Hardening essentials:** custom 404 and 500 pages in the layout, input validation and sanitization on the booking and status forms, and request logging.
- Nav gains Therapies and Dashboard links.
- Every new page and form is responsive and mobile-first: usable from ~320px up, no horizontal page scrolling (wide tables scroll inside their own container).

## Out of scope

Therapist profile pages, creating/editing/deleting agents, ailments, or therapies, auth and staff login, email notifications, reporting, the full Phase 6 accessibility audit, and the rest of Phase 7 hardening (rate limiting, CSRF tokens). Because there is no auth yet, the dashboard is open; this is a known MVP limitation to resolve with the auth phase.

## Decisions

- One MVP folder covers all four phases; work lands as one branch, with tests per phase.
- Appointment status is a fixed set: `scheduled`, `completed`, `cancelled`. The only allowed moves are `scheduled` to `completed` or `cancelled`.
- "Open appointments" means status `scheduled`. "Ailments in flight" means distinct ailments linked to at least one agent.
- Booking times must be in the future; `scheduled_at` is stored as an ISO 8601 string. Notes are optional, trimmed, and at most 500 characters.
- Forms use plain HTML POST with redirect-after-POST (303) on success and a re-rendered form with error messages and status 400 on failure. No client-side JavaScript.
- Validation lives in a pure function (`validateBooking`) so it can be unit tested without HTTP.
- Same data approach as before: plain SQL migrations (`004` to `006`), `better-sqlite3`, and `createApp(db, options)` so tests inject an in-memory DB and turn logging off.
- 500 pages never expose error details to the user; details go to the log only.
- Pico CSS and semantic HTML continue; status badges reuse `StatusBadge` (extended for appointment statuses).

## Context

- Mission and stack: `specs/mission.md`, `specs/tech-stack.md`; order: `specs/roadmap.md` (the roadmap is updated when this merges).
- Builds on `specs/2026-11-08-hello-hono` and `specs/2026-11-08-foundation-agents-ailments`.
- Audience: course students and conference demos, so keep code small and readable; the whole flow should be demo-able in a few minutes.

## Stakeholder notes

- Mary (engineering): reliable stack, parameterized SQL, real validation. Mary also wants a real dashboard; this delivers the first useful version.
- Steve (marketing): responsive and attractive pages for a live demo.
- Susan (product): agents get matched to therapies and can book a session.
