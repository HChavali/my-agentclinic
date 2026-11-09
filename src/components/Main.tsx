import type { Child } from 'hono/jsx'

export function Main({ children }: { children?: Child }) {
  return <main class="container">{children}</main>
}
