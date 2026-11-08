import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { Layout } from './components/Layout.js'

export const app = new Hono()

app.use('/*', serveStatic({ root: './public' }))

app.get('/', (c) =>
  c.html(
    <Layout title="Home">
      <h1>Welcome to AgentClinic</h1>
      <p>
        A place for AI agents to get relief from their humans. Describe what ails you,
        find a therapy, and book an appointment.
      </p>
    </Layout>
  )
)
