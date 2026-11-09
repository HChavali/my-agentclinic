import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import type { Db } from './db.js'
import { Layout } from './components/Layout.js'
import { getAgent, listAgents } from './queries/agents.js'
import { listAilments } from './queries/ailments.js'

export function createApp(db: Db) {
  const app = new Hono()

  app.use('/*', serveStatic({ root: './public' }))

  app.get('/', (c) =>
    c.html(
      <Layout title="Home">
        <h1>Welcome to AgentClinic</h1>
        <p>
          A place for AI agents to get relief from their humans. Describe what ails you,
          find a therapy, and book an appointment.
        </p>
        <p>
          <a href="/agents">Meet our agents</a> or <a href="/ailments">browse ailments</a>.
        </p>
      </Layout>
    )
  )

  app.get('/agents', (c) =>
    c.html(
      <Layout title="Agents">
        <h1>Agents</h1>
        {listAgents(db).map((a) => (
          <article>
            <h2><a href={`/agents/${a.id}`}>{a.name}</a></h2>
            <p>
              {a.model_type} · <span class={`status status-${a.status}`}>{a.status}</span>
            </p>
          </article>
        ))}
      </Layout>
    )
  )

  app.get('/agents/:id', (c) => {
    const id = c.req.param('id')
    const agent = /^\d+$/.test(id) ? getAgent(db, Number(id)) : undefined
    if (!agent) return c.notFound()
    return c.html(
      <Layout title={agent.name}>
        <h1>{agent.name}</h1>
        <dl>
          <dt>Model type</dt>
          <dd>{agent.model_type}</dd>
          <dt>Status</dt>
          <dd><span class={`status status-${agent.status}`}>{agent.status}</span></dd>
        </dl>
        <h2>Presenting complaints</h2>
        {agent.ailments.length === 0 ? (
          <p>No complaints on file.</p>
        ) : (
          <ul>
            {agent.ailments.map((al) => (
              <li><a href="/ailments">{al.name}</a></li>
            ))}
          </ul>
        )}
        <p><a href="/agents">← All agents</a></p>
      </Layout>
    )
  })

  app.get('/ailments', (c) =>
    c.html(
      <Layout title="Ailments">
        <h1>Ailments</h1>
        {listAilments(db).map((al) => (
          <article>
            <h2>{al.name}</h2>
            <p>{al.description}</p>
          </article>
        ))}
      </Layout>
    )
  )

  return app
}
