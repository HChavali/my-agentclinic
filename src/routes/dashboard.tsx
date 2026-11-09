import type { Hono } from 'hono'
import type { Db } from '../db.js'
import { Layout } from '../components/Layout.js'
import { StatusBadge } from '../components/StatusBadge.js'
import { listAgents } from '../queries/agents.js'
import { listAilments } from '../queries/ailments.js'
import { listAppointments } from '../queries/appointments.js'
import { getCounts } from '../queries/dashboard.js'

export function dashboardRoutes(app: Hono, db: Db) {
  app.get('/dashboard', (c) => {
    const counts = getCounts(db)
    return c.html(
      <Layout title="Dashboard">
        <h1>Staff dashboard</h1>

        <section class="grid" aria-label="Summary">
          <article>
            <h2 class="count">{counts.agents}</h2>
            <p>Agents</p>
          </article>
          <article>
            <h2 class="count">{counts.openAppointments}</h2>
            <p>Open appointments</p>
          </article>
          <article>
            <h2 class="count">{counts.ailmentsInFlight}</h2>
            <p>Ailments in flight</p>
          </article>
        </section>

        <h2>Appointments</h2>
        <div class="overflow-auto">
          <table>
            <thead>
              <tr>
                <th scope="col">Agent</th>
                <th scope="col">Therapist</th>
                <th scope="col">When</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listAppointments(db).map((a) => (
                <tr>
                  <td><a href={`/appointments/${a.id}`}>{a.agent_name}</a></td>
                  <td>{a.therapist_name}</td>
                  <td>{a.scheduled_at.replace('T', ' ')}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {a.status === 'scheduled' ? (
                      <form class="row-actions" method="post" action={`/appointments/${a.id}/status`}>
                        <button class="secondary" name="status" value="completed">Complete</button>
                        <button class="secondary outline" name="status" value="cancelled">Cancel</button>
                      </form>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Agents</h2>
        <div class="overflow-auto">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Model type</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {listAgents(db).map((a) => (
                <tr>
                  <td><a href={`/agents/${a.id}`}>{a.name}</a></td>
                  <td>{a.model_type}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Ailments</h2>
        <div class="overflow-auto">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {listAilments(db).map((a) => (
                <tr>
                  <td>{a.name}</td>
                  <td>{a.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Layout>
    )
  })
}
