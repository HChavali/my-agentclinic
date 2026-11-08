# Roadmap

Phases are intentionally small — each one is a shippable slice of work, independently reviewable and testable.

**Cross-cutting requirement:** every page and component in every phase follows responsive, mobile-first design (see `mission.md`). Each feature spec must include responsive acceptance criteria.

---

## Phase 1 — Hello Hono
- Install and configure Hono with `tsx` dev server
- Single `/` route returning "AgentClinic is open for business"
- Confirm TypeScript types work end-to-end

## Phase 2 — Foundation: Layout, Agents, Ailments
- Server-side JSX layout component (header, nav, main, footer); all routes render inside it
- Basic CSS (custom properties, reset, typography), written mobile-first and responsive
- Viewport meta tag in the layout
- SQLite database + first migration (`agents` table); seed a handful of fictional agents
- `/agents` page listing all agents
- `/agents/:id` page showing a single agent's profile (name, model type, current status, presenting complaints)
- `ailments` table + seed data (e.g., "context-window claustrophobia", "prompt fatigue")
- `/ailments` list page
- Link agents to one or more ailments

## Phase 3 — Therapies Catalog
- `therapies` table + seed data
- `/therapies` list page
- Map ailments → recommended therapies

## Phase 4 — Appointment Booking
- `appointments` table (agent, therapist, datetime, status)
- Form to book an appointment from an agent's detail page
- Basic validation and confirmation page

## Phase 5 — Staff Dashboard
- `/dashboard` with summary counts: agents, open appointments, ailments in-flight
- Simple table views for staff to manage records
- Mary's dashboard is now real

## Phase 6 — Polish & Accessibility
- Responsive audit across all pages on phone, tablet, and desktop widths (responsive design is built in from Phase 2; this phase verifies it)
- Semantic HTML audit
- Keyboard navigation and focus styles

## Phase 7 — Hardening
- Error pages (404, 500)
- Input sanitization on all forms
- Basic logging middleware

---

Later phases (not yet planned): auth, email notifications, therapist profiles, reporting.
