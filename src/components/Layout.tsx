import type { Child } from 'hono/jsx'

export function Layout({ title, children }: { title: string; children?: Child }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title} · AgentClinic</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <header class="site-header">
          <a class="brand" href="/">AgentClinic</a>
          <p class="tagline">Relief for agents, from their humans.</p>
          <nav aria-label="Main">
            <a href="/">Home</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer class="site-footer">
          <p>No agents were over-prompted in the making of this clinic.</p>
        </footer>
      </body>
    </html>
  )
}
