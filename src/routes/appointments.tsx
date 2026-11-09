import type { Hono } from 'hono'
import type { Db } from '../db.js'
import { Layout } from '../components/Layout.js'
import { BookingForm } from '../components/BookingForm.js'
import { StatusBadge } from '../components/StatusBadge.js'
import { getAgent } from '../queries/agents.js'
import { canMove, createAppointment, getAppointment, updateStatus } from '../queries/appointments.js'
import { listTherapists } from '../queries/therapists.js'
import { formText, parseId } from '../util.js'
import { validateBooking } from '../validation.js'

export function appointmentRoutes(app: Hono, db: Db) {
  app.get('/agents/:id/book', (c) => {
    const id = parseId(c.req.param('id'))
    const agent = id === undefined ? undefined : getAgent(db, id)
    if (!agent) return c.notFound()
    return c.html(
      <Layout title={`Book ${agent.name}`}>
        <h1>Book an appointment for {agent.name}</h1>
        <BookingForm
          agentId={agent.id}
          therapists={listTherapists(db)}
          values={{ therapist_id: '', scheduled_at: '', notes: '' }}
          errors={{}}
        />
      </Layout>
    )
  })

  app.post('/agents/:id/appointments', async (c) => {
    const id = parseId(c.req.param('id'))
    const agent = id === undefined ? undefined : getAgent(db, id)
    if (!agent) return c.notFound()

    const body = await c.req.parseBody()
    const input = {
      therapist_id: formText(body.therapist_id),
      scheduled_at: formText(body.scheduled_at),
      notes: formText(body.notes),
    }
    const result = validateBooking(input, db)

    if (!result.ok) {
      return c.html(
        <Layout title={`Book ${agent.name}`}>
          <h1>Book an appointment for {agent.name}</h1>
          <p role="alert">Please fix the problems below.</p>
          <BookingForm
            agentId={agent.id}
            therapists={listTherapists(db)}
            values={{
              therapist_id: input.therapist_id,
              scheduled_at: input.scheduled_at,
              notes: input.notes,
            }}
            errors={result.errors}
          />
        </Layout>,
        400
      )
    }

    const appointmentId = createAppointment(db, { agentId: agent.id, ...result.values })
    return c.redirect(`/appointments/${appointmentId}`, 303)
  })

  app.get('/appointments/:id', (c) => {
    const id = parseId(c.req.param('id'))
    const appt = id === undefined ? undefined : getAppointment(db, id)
    if (!appt) return c.notFound()
    return c.html(
      <Layout title="Appointment confirmed">
        <h1>Appointment {appt.status === 'cancelled' ? 'cancelled' : 'confirmed'}</h1>
        <dl>
          <dt>Agent</dt>
          <dd><a href={`/agents/${appt.agent_id}`}>{appt.agent_name}</a></dd>
          <dt>Therapist</dt>
          <dd>{appt.therapist_name}</dd>
          <dt>When</dt>
          <dd>{appt.scheduled_at.replace('T', ' ')}</dd>
          <dt>Status</dt>
          <dd><StatusBadge status={appt.status} /></dd>
          {appt.notes && (
            <>
              <dt>Notes</dt>
              <dd>{appt.notes}</dd>
            </>
          )}
        </dl>
        <p><a href="/dashboard">Staff dashboard</a></p>
      </Layout>
    )
  })

  // Staff action from the dashboard: scheduled -> completed or cancelled.
  app.post('/appointments/:id/status', async (c) => {
    const id = parseId(c.req.param('id'))
    const appt = id === undefined ? undefined : getAppointment(db, id)
    if (!appt) return c.notFound()

    const status = formText((await c.req.parseBody()).status)
    if (!canMove(appt.status, status)) {
      return c.html(
        <Layout title="Cannot update appointment">
          <h1>Cannot update appointment</h1>
          <p>
            A {appt.status} appointment cannot be changed to “{status}”. Only scheduled
            appointments can be marked completed or cancelled.
          </p>
          <p><a href="/dashboard">Back to the dashboard</a></p>
        </Layout>,
        400
      )
    }
    updateStatus(db, appt.id, status)
    return c.redirect('/dashboard', 303)
  })
}
