# MVP — Plan

Roadmap Phases 3, 4, 5, plus the Phase 7 essentials. Builds on `specs/2026-11-08-foundation-agents-ailments`.

## Group 1 — Therapies catalog (Phase 3)

1. `migrations/004_therapies.sql`: `therapies` (id, name, description) and `ailment_therapies` join (ailment_id, therapy_id).
2. Extend `src/seed.ts` with ~6 therapies and ailment-to-therapy links; keep seeding idempotent.
3. `src/queries/therapies.ts`: `listTherapies(db)`, `therapiesForAilment(db, ailmentId)`.
4. `GET /therapies` list page; show each ailment's recommended therapies on `/ailments`, and on an agent's profile under "Recommended therapies".
5. Add Therapies to the header nav.

## Group 2 — Therapists

6. `migrations/005_therapists.sql`: `therapists` (id, name, specialty); seed ~4 therapists. No profile pages.
7. `src/queries/therapists.ts`: `listTherapists(db)`, `getTherapist(db, id)`.

## Group 3 — Appointment booking (Phase 4)

8. `migrations/006_appointments.sql`: `appointments` (id, agent_id, therapist_id, scheduled_at, status, notes, created_at); `status` CHECK in `scheduled`, `completed`, `cancelled`; foreign keys.
9. `src/validation.ts`: pure `validateBooking(input, db, now)` returning cleaned values or a list of field errors (therapist exists, valid future datetime, notes trimmed and at most 500 characters).
10. `src/queries/appointments.ts`: `createAppointment`, `getAppointment`, `listAppointments`, `updateStatus`.
11. Routes: `GET /agents/:id/book` (form with therapist select, datetime, notes), `POST /agents/:id/appointments` (invalid → re-render form with errors and status 400; valid → redirect 303), `GET /appointments/:id` confirmation page. Unknown agent or appointment → 404.
12. Add a "Book an appointment" link on the agent profile.

## Group 4 — Staff dashboard (Phase 5)

13. `src/queries/dashboard.ts`: counts of agents, open (`scheduled`) appointments, and ailments in flight (distinct ailments linked to at least one agent).
14. `GET /dashboard`: summary count cards plus tables of agents, appointments (agent, therapist, time, status), and ailments; tables wrapped in Pico's `overflow-auto` for small screens.
15. `POST /appointments/:id/status` (staff form on the dashboard): allowed moves are `scheduled` to `completed` or `cancelled`; anything else → 400; redirect 303 back to `/dashboard`.
16. Add Dashboard to the header nav.

## Group 5 — Hardening essentials (Phase 7 subset)

17. Custom 404 page and `app.onError` 500 page, both rendered in the layout; 500s never show internals.
18. Logging middleware (`hono/logger`), switched off in tests via a `createApp` option.
19. Review every form input path: server-side validation, trimmed and length-limited text, parameterized SQL only, output escaped by JSX.

## Group 6 — Tests and verify

20. Tests per feature in `tests/` (in-memory DB): therapies, booking (valid and each invalid case), confirmation, dashboard counts and status changes, error pages, nav links, responsive markup.
21. One end-to-end flow test: open an agent, book an appointment, see the confirmation, see the dashboard open-appointment count rise, mark it completed, see the count fall.
22. Run `npm run validate`; start `npm run dev` and `curl` the main pages; do the manual 320px / tablet / desktop check; update `CHANGELOG.md`.
