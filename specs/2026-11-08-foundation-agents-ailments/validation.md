# Foundation: Layout, Agents, Ailments — Validation

Done and ready to merge when all of these hold:

1. `npm run validate` exits 0 (`tsc --noEmit` and Vitest both pass).
2. Tests use an in-memory SQLite DB with migrations and seed applied; no test depends on `data/agentclinic.db`.
3. Migrations: applying them twice is safe, and `agents`, `ailments`, `agent_ailments` exist afterward; seeding twice does not duplicate rows.
4. `GET /agents` → 200 HTML listing every seeded agent, each linking to `/agents/:id`.
5. `GET /agents/:id` → 200 with name, model type, status, and presenting complaints; `/agents/9999` and `/agents/abc` → 404.
6. `GET /ailments` → 200 HTML listing every seeded ailment with its description.
7. Every page renders inside the layout (header, nav, main, footer), and nav links to Home, Agents, and Ailments.
8. Responsive: every page includes `<meta name="viewport" content="width=device-width, initial-scale=1">`; the layout links the Pico CSS stylesheet and `/styles.css` (200, `text/css`) with only overrides in it; content sits in a Pico `container`; at ~320px there is no horizontal scrolling.
9. `npm run dev` starts the server and `curl localhost:3000/agents` returns the agents page.
