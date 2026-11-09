import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { openDb } from './db.js'

const app = createApp(openDb())
const port = Number(process.env.PORT) || 3000
serve({ fetch: app.fetch, port }, () => {
  console.log(`AgentClinic running at http://localhost:${port}`)
})
