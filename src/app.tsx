import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serveStatic } from '@hono/node-server/serve-static'
import type { Db } from './db.js'
import { Layout } from './components/Layout.js'
import { StatusBadge } from './components/StatusBadge.js'
import { getAgent, listAgents } from './queries/agents.js'
import { listAilments } from './queries/ailments.js'
import { listTherapies, therapiesForAgent, therapiesForAilment } from './queries/therapies.js'
import { appointmentRoutes } from './routes/appointments.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { parseId } from './util.js'

export type AppOptions = { log?: boolean }

export function createApp(db: Db, { log = true }: AppOptions = {}) {
  const app = new Hono()

  if (log) app.use(logger())
  app.use('/*', serveStatic({ root: './public' }))

  app.notFound((c) =>
    c.html(
      <Layout title="Page not found">
        <h1>Page not found</h1>
        <p>We could not find that page. <a href="/">Back to the home page</a>.</p>
      </Layout>,
      404
    )
  )

  // Details go to the log only; the user never sees the error message or stack.
  app.onError((err, c) => {
    console.error(err)
    return c.html(
      <Layout title="Something went wrong">
        <h1>Something went wrong</h1>
        <p>Sorry, that did not work. Please try again. <a href="/">Back to the home page</a>.</p>
      </Layout>,
      500
    )
  })

  app.get('/', (c) =>
    c.html(
      <Layout title="Home">
        <h1>Welcome to AgentClinic</h1>
        <p>
          A place for AI agents to get relief from their humans. Meet the agents in our care,
          see what ails them, and book an appointment with a therapist.
        </p>
        <p>
          <a href="/agents">Meet our agents</a>, <a href="/ailments">browse ailments</a>, or{' '}
          <a href="/therapies">explore therapies</a>.
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
              {a.model_type} · <StatusBadge status={a.status} />
            </p>
          </article>
        ))}
      </Layout>
    )
  )

  app.get('/agents/:id', (c) => {
    const id = parseId(c.req.param('id'))
    const agent = id === undefined ? undefined : getAgent(db, id)
    if (!agent) return c.notFound()
    const therapies = therapiesForAgent(db, agent.id)
    return c.html(
      <Layout title={agent.name}>
        <h1>{agent.name}</h1>
        <dl>
          <dt>Model type</dt>
          <dd>{agent.model_type}</dd>
          <dt>Status</dt>
          <dd><StatusBadge status={agent.status} /></dd>
        </dl>
        <h2>Presenting complaints</h2>
        {agent.ailments.length === 0 ? (
          <p>No complaints on file.</p>
        ) : (
          <ul>
            {agent.ailments.map((al) => (
              <li><a href={`/ailments#ailment-${al.id}`}>{al.name}</a></li>
            ))}
          </ul>
        )}
        <h2>Recommended therapies</h2>
        {therapies.length === 0 ? (
          <p>No therapies recommended yet.</p>
        ) : (
          <ul>
            {therapies.map((t) => (
              <li><a href={`/therapies#therapy-${t.id}`}>{t.name}</a></li>
            ))}
          </ul>
        )}
        <p><a role="button" href={`/agents/${agent.id}/book`}>Book an appointment</a></p>
        <p><a href="/agents">← All agents</a></p>
      </Layout>
    )
  })

  app.get('/ailments', (c) =>
    c.html(
      <Layout title="Ailments">
        <h1>Ailments</h1>
        {listAilments(db).map((al) => {
          const therapies = therapiesForAilment(db, al.id)
          return (
            <article id={`ailment-${al.id}`}>
              <h2>{al.name}</h2>
              <p>{al.description}</p>
              {therapies.length > 0 && (
                <p>
                  Recommended therapies:{' '}
                  {therapies.map((t, i) => (
                    <>
                      {i > 0 && ', '}
                      <a href={`/therapies#therapy-${t.id}`}>{t.name}</a>
                    </>
                  ))}
                </p>
              )}
            </article>
          )
        })}
      </Layout>
    )
  )

  app.get('/therapies', (c) =>
    c.html(
      <Layout title="Therapies">
        <h1>Therapies</h1>
        {listTherapies(db).map((t) => (
          <article id={`therapy-${t.id}`}>
            <h2>{t.name}</h2>
            <p>{t.description}</p>
          </article>
        ))}
      </Layout>
    )
  )

  appointmentRoutes(app, db)
  dashboardRoutes(app, db)

  return app
}
