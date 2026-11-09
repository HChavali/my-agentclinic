# Hello Hono — Validation

Done when all of these hold:

1. `npm run typecheck` exits 0 with no errors.
2. `npm test` passes: `GET /` → 200 HTML, `GET /nope` → 404.
3. `npm run dev` starts the server and `curl localhost:3000` returns 200 HTML containing "Welcome to AgentClinic".
4. The page has header, nav, main, and footer elements and links `/styles.css`; `/styles.css` returns 200 as `text/css`.
5. Responsive: the page includes `<meta name="viewport" content="width=device-width, initial-scale=1">`, and `styles.css` is mobile-first (contains `min-width` media queries); at ~320px wide there is no horizontal scrolling.
6. `strict: true` is on and `hono` / `@hono/node-server` are installed.
