# MVP — Validation

Done and ready to merge when all of these hold. Tests use an in-memory SQLite DB with migrations and seed applied.

## Automated

1. `npm run validate` exits 0 (`tsc --noEmit` and Vitest).
2. **Migrations and seed:** migrations `004` to `006` apply cleanly, applying them or seeding twice changes nothing, and `therapies`, `ailment_therapies`, `therapists`, `appointments` exist.
3. **Therapies:** `GET /therapies` lists every seeded therapy; `/ailments` and an agent's profile show their recommended therapies.
4. **Booking form:** `GET /agents/:id/book` renders a form with a therapist select, datetime, and notes; an unknown agent id returns 404.
5. **Booking validation:** `POST /agents/:id/appointments` rejects (400, form re-rendered with an error message and the entered values kept) a missing or unknown therapist, a missing or malformed datetime, a datetime in the past, and notes over 500 characters. `validateBooking` has unit tests for each case.
6. **Booking success:** a valid POST creates one appointment with status `scheduled` and redirects (303) to `/appointments/:id`, which shows the agent, therapist, time, and status; an unknown appointment id returns 404.
7. **Dashboard:** `/dashboard` shows correct counts for agents, open appointments, and ailments in flight, and tables of agents, appointments, and ailments.
8. **Status updates:** `POST /appointments/:id/status` moves `scheduled` to `completed` or `cancelled`; any other move or value returns 400; the open-appointment count updates accordingly.
9. **Hardening:** unknown routes return a 404 page rendered in the layout; a forced handler error returns a 500 page in the layout with no stack trace or error message; user-supplied text containing `<script>` is rendered escaped; an injection-style string in notes is stored literally and breaks nothing.
10. **Logging:** requests are logged in normal runs and silenced in tests via the `createApp` option.
11. **Layout and responsive markup:** every new page starts with `<!DOCTYPE html>`, renders inside the layout, includes the viewport meta, and nav links to Home, Agents, Ailments, Therapies, and Dashboard; wide tables sit inside an `overflow-auto` wrapper.
12. **End-to-end flow test:** open an agent, book an appointment, land on the confirmation, see the dashboard open-appointment count increase, mark it completed, and see the count decrease.

## Manual

13. `npm run dev` starts the server and `curl localhost:3000/therapies`, `/dashboard`, and `/agents/1/book` return 200.
14. In a browser at ~320px, tablet, and desktop widths: no horizontal page scrolling, the booking form is usable, and dashboard tables scroll within their container.
