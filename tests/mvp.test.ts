import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { openDb, type Db } from '../src/db.js'
import { migrate } from '../src/migrate.js'
import { seed } from '../src/seed.js'
import { validateBooking } from '../src/validation.js'

let db: Db
let app: ReturnType<typeof createApp>

beforeEach(() => {
  db = openDb(':memory:')
  app = createApp(db, { log: false })
})

const count = (table: string, where = '1=1') =>
  db.prepare(`SELECT COUNT(*) FROM ${table} WHERE ${where}`).pluck().get() as number

const get = async (path: string) => {
  const res = await app.request(path)
  return { res, html: await res.text() }
}

const post = async (path: string, data: Record<string, string>) => {
  const res = await app.request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data),
  })
  return { res, html: await res.text() }
}

// "YYYY-MM-DDTHH:MM" in local time, `days` from now (what <input type="datetime-local"> sends).
const when = (days: number) => {
  const d = new Date(Date.now() + days * 86_400_000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const firstTherapistId = () => String(db.prepare('SELECT id FROM therapists ORDER BY id').pluck().get())
const firstAgentId = () => db.prepare('SELECT id FROM agents ORDER BY id').pluck().get() as number

const book = (agentId: number, overrides: Record<string, string> = {}) =>
  post(`/agents/${agentId}/appointments`, {
    therapist_id: firstTherapistId(),
    scheduled_at: when(7),
    notes: '',
    ...overrides,
  })

describe('migrations and seed', () => {
  it('creates the MVP tables', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").pluck().all()
    expect(tables).toEqual(
      expect.arrayContaining(['therapies', 'ailment_therapies', 'therapists', 'appointments'])
    )
    expect(count('therapies')).toBeGreaterThanOrEqual(5)
    expect(count('ailment_therapies')).toBeGreaterThan(0)
    expect(count('therapists')).toBeGreaterThanOrEqual(3)
  })

  it('migrating and seeding twice changes nothing', () => {
    const tables = ['agents', 'ailments', 'agent_ailments', 'therapies', 'ailment_therapies', 'therapists', 'schema_migrations']
    const before = tables.map((t) => count(t))
    migrate(db)
    seed(db)
    expect(tables.map((t) => count(t))).toEqual(before)
  })

  it('seeds therapies and therapists into a database that already has agents', () => {
    db.exec('DELETE FROM ailment_therapies; DELETE FROM therapies; DELETE FROM therapists;')
    seed(db)
    expect(count('therapies')).toBeGreaterThan(0)
    expect(count('therapists')).toBeGreaterThan(0)
    expect(count('agents')).toBe(6)
  })
})

describe('therapies', () => {
  it('GET /therapies lists every therapy', async () => {
    const { res, html } = await get('/therapies')
    expect(res.status).toBe(200)
    const rows = db.prepare('SELECT id, name, description FROM therapies').all() as {
      id: number
      name: string
      description: string
    }[]
    for (const t of rows) {
      expect(html).toContain(esc(t.name))
      expect(html).toContain(esc(t.description))
      expect(html).toContain(`id="therapy-${t.id}"`)
    }
  })

  it('/ailments shows recommended therapies for each ailment', async () => {
    const { html } = await get('/ailments')
    const links = db
      .prepare(
        'SELECT therapies.id, therapies.name FROM therapies JOIN ailment_therapies ON therapy_id = therapies.id'
      )
      .all() as { id: number; name: string }[]
    expect(links.length).toBeGreaterThan(0)
    expect(html).toContain('Recommended therapies')
    for (const t of links) expect(html).toContain(`href="/therapies#therapy-${t.id}"`)
  })

  it("an agent's profile shows recommended therapies and a booking link", async () => {
    const row = db
      .prepare(
        `SELECT DISTINCT agent_ailments.agent_id AS agent, therapies.name
         FROM agent_ailments
         JOIN ailment_therapies ON ailment_therapies.ailment_id = agent_ailments.ailment_id
         JOIN therapies ON therapies.id = ailment_therapies.therapy_id LIMIT 1`
      )
      .get() as { agent: number; name: string }
    const { html } = await get(`/agents/${row.agent}`)
    expect(html).toContain('Recommended therapies')
    expect(html).toContain(esc(row.name))
    expect(html).toContain(`href="/agents/${row.agent}/book"`)
  })
})

describe('validateBooking', () => {
  const now = new Date(2026, 5, 1, 12, 0)
  const ok = { therapist_id: '', scheduled_at: '2026-06-02T10:00', notes: '' }
  const therapistId = () => firstTherapistId()

  it('accepts a valid booking and trims notes', () => {
    const r = validateBooking({ ...ok, therapist_id: therapistId(), notes: '  hello  ' }, db, now)
    expect(r).toEqual({
      ok: true,
      values: { therapistId: Number(therapistId()), scheduledAt: '2026-06-02T10:00', notes: 'hello' },
    })
  })

  it.each([
    ['missing therapist', { therapist_id: '' }, 'therapist'],
    ['non-numeric therapist', { therapist_id: 'abc' }, 'therapist'],
    ['unknown therapist', { therapist_id: '9999' }, 'therapist'],
    ['missing datetime', { scheduled_at: '' }, 'scheduled_at'],
    ['malformed datetime', { scheduled_at: 'tomorrow' }, 'scheduled_at'],
    ['impossible date', { scheduled_at: '2026-02-30T10:00' }, 'scheduled_at'],
    ['past datetime', { scheduled_at: '2026-05-31T10:00' }, 'scheduled_at'],
    ['notes too long', { notes: 'x'.repeat(501) }, 'notes'],
  ])('rejects %s', (_name, override, field) => {
    const r = validateBooking({ ...ok, therapist_id: therapistId(), ...override }, db, now)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(Object.keys(r.errors)).toContain(field)
  })

  it('accepts notes of exactly 500 characters', () => {
    const r = validateBooking({ ...ok, therapist_id: therapistId(), notes: 'x'.repeat(500) }, db, now)
    expect(r.ok).toBe(true)
  })
})

describe('booking', () => {
  it('GET /agents/:id/book renders the form', async () => {
    const { res, html } = await get(`/agents/${firstAgentId()}/book`)
    expect(res.status).toBe(200)
    expect(html).toContain('<form')
    expect(html).toContain('name="therapist_id"')
    expect(html).toContain('name="scheduled_at"')
    expect(html).toContain('name="notes"')
    const therapists = db.prepare('SELECT name FROM therapists').pluck().all() as string[]
    for (const name of therapists) expect(html).toContain(esc(name))
  })

  it('unknown agents return 404 for the form and the POST', async () => {
    expect((await app.request('/agents/9999/book')).status).toBe(404)
    expect((await app.request('/agents/abc/book')).status).toBe(404)
    expect((await book(9999)).res.status).toBe(404)
  })

  it('a valid booking creates a scheduled appointment and redirects to the confirmation', async () => {
    const agent = firstAgentId()
    const { res } = await book(agent, { notes: 'Feeling overwhelmed' })
    expect(res.status).toBe(303)
    const location = res.headers.get('location')!
    expect(location).toMatch(/^\/appointments\/\d+$/)
    expect(count('appointments')).toBe(1)

    const { res: page, html } = await get(location)
    expect(page.status).toBe(200)
    const agentName = db.prepare('SELECT name FROM agents WHERE id = ?').pluck().get(agent) as string
    const therapistName = db.prepare('SELECT name FROM therapists WHERE id = ?').pluck().get(firstTherapistId()) as string
    expect(html).toContain(esc(agentName))
    expect(html).toContain(esc(therapistName))
    expect(html).toContain('Scheduled')
    expect(html).toContain('Feeling overwhelmed')
    expect(count('appointments', "status = 'scheduled'")).toBe(1)
  })

  it('invalid bookings return 400, show errors, keep entered values, and create nothing', async () => {
    const agent = firstAgentId()
    const cases: [Record<string, string>, string][] = [
      [{ therapist_id: '' }, 'Please choose a therapist.'],
      [{ therapist_id: '9999' }, 'That therapist does not exist.'],
      [{ scheduled_at: '' }, 'Please choose a date and time.'],
      [{ scheduled_at: 'soon' }, 'Please enter a valid date and time.'],
      [{ scheduled_at: '2000-01-01T10:00' }, 'must be in the future'],
      [{ notes: 'x'.repeat(501) }, 'at most 500 characters'],
    ]
    for (const [override, message] of cases) {
      const { res, html } = await book(agent, override)
      expect(res.status).toBe(400)
      expect(html).toContain(message)
      expect(html).toContain('<form')
    }
    expect(count('appointments')).toBe(0)

    const { html } = await book(agent, { scheduled_at: 'soon', notes: 'keep me' })
    expect(html).toContain('keep me')
    expect(html).toContain('value="soon"')
  })

  it('unknown appointments return 404', async () => {
    expect((await app.request('/appointments/9999')).status).toBe(404)
    expect((await app.request('/appointments/abc')).status).toBe(404)
  })
})

describe('dashboard', () => {
  it('shows counts and tables', async () => {
    const { res, html } = await get('/dashboard')
    expect(res.status).toBe(200)
    expect(html).toContain('Open appointments')
    expect(html).toContain('Ailments in flight')
    const inFlight = count('(SELECT DISTINCT ailment_id FROM agent_ailments)')
    expect(html).toContain(`<h2 class="count">${count('agents')}</h2>`)
    expect(html).toContain(`<h2 class="count">${inFlight}</h2>`)
    expect(html).toContain('<h2 class="count">0</h2>')
    for (const name of db.prepare('SELECT name FROM agents').pluck().all() as string[])
      expect(html).toContain(esc(name))
    for (const name of db.prepare('SELECT name FROM ailments').pluck().all() as string[])
      expect(html).toContain(esc(name))
    expect(html).toContain('class="overflow-auto"')
  })

  it('lists appointments with actions for scheduled ones', async () => {
    await book(firstAgentId())
    const id = db.prepare('SELECT id FROM appointments').pluck().get()
    const { html } = await get('/dashboard')
    expect(html).toContain(`action="/appointments/${id}/status"`)
    expect(html).toContain('value="completed"')
    expect(html).toContain('value="cancelled"')
  })

  it('status updates move scheduled to completed or cancelled and change the open count', async () => {
    const agent = firstAgentId()
    await book(agent)
    await book(agent)
    const ids = db.prepare('SELECT id FROM appointments ORDER BY id').pluck().all() as number[]
    expect(count('appointments', "status = 'scheduled'")).toBe(2)

    const done = await post(`/appointments/${ids[0]}/status`, { status: 'completed' })
    expect(done.res.status).toBe(303)
    expect(done.res.headers.get('location')).toBe('/dashboard')
    const cancelled = await post(`/appointments/${ids[1]}/status`, { status: 'cancelled' })
    expect(cancelled.res.status).toBe(303)

    expect(count('appointments', "status = 'completed'")).toBe(1)
    expect(count('appointments', "status = 'cancelled'")).toBe(1)
    expect(count('appointments', "status = 'scheduled'")).toBe(0)
  })

  it('rejects invalid status changes with 400 and leaves the appointment alone', async () => {
    await book(firstAgentId())
    const id = db.prepare('SELECT id FROM appointments').pluck().get() as number

    expect((await post(`/appointments/${id}/status`, { status: 'bogus' })).res.status).toBe(400)
    expect((await post(`/appointments/${id}/status`, { status: 'scheduled' })).res.status).toBe(400)
    expect((await post(`/appointments/${id}/status`, {})).res.status).toBe(400)
    expect(count('appointments', "status = 'scheduled'")).toBe(1)

    await post(`/appointments/${id}/status`, { status: 'completed' })
    expect((await post(`/appointments/${id}/status`, { status: 'cancelled' })).res.status).toBe(400)
    expect(count('appointments', "status = 'completed'")).toBe(1)

    expect((await post('/appointments/9999/status', { status: 'completed' })).res.status).toBe(404)
  })
})

describe('hardening', () => {
  it('unknown routes render a 404 page inside the layout', async () => {
    const { res, html } = await get('/nope')
    expect(res.status).toBe(404)
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('Page not found')
    expect(html).toContain('<nav')
  })

  it('handler errors render a 500 page with no internals', async () => {
    const original = console.error
    console.error = () => {}
    try {
      app.get('/boom', () => {
        throw new Error('secret database detail')
      })
      const { res, html } = await get('/boom')
      expect(res.status).toBe(500)
      expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
      expect(html).toContain('Something went wrong')
      expect(html).not.toContain('secret database detail')
      expect(html).not.toContain('Error:')
      expect(html).not.toContain('node_modules')
      expect(html).not.toMatch(/\.tsx?:\d+/)
    } finally {
      console.error = original
    }
  })

  it('user text is escaped, never rendered as HTML', async () => {
    const evil = '<script>alert(1)</script>'
    await book(firstAgentId(), { notes: evil })
    const id = db.prepare('SELECT id FROM appointments').pluck().get()
    const { html } = await get(`/appointments/${id}`)
    expect(html).not.toContain('<script>alert(1)')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('injection-style notes are stored literally and break nothing', async () => {
    const nasty = "'); DROP TABLE agents; --"
    const { res } = await book(firstAgentId(), { notes: nasty })
    expect(res.status).toBe(303)
    expect(db.prepare('SELECT notes FROM appointments').pluck().get()).toBe(nasty)
    expect(count('agents')).toBe(6)
  })

  it('logging can be switched off, and is on by default', async () => {
    const lines: string[] = []
    const original = console.log
    console.log = (...args: unknown[]) => void lines.push(args.join(' '))
    try {
      await createApp(db, { log: false }).request('/')
      expect(lines).toHaveLength(0)
      await createApp(db).request('/')
      expect(lines.some((l) => l.includes('GET') && l.includes('/'))).toBe(true)
    } finally {
      console.log = original
    }
  })
})

describe('layout for the new pages', () => {
  const pages = ['/therapies', '/dashboard', '/agents/1/book']

  it.each(pages)('%s renders inside the layout with the full nav and responsive markup', async (path) => {
    const { res, html } = await get(path)
    expect(res.status).toBe(200)
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1"')
    const nav = html.slice(html.indexOf('<nav'), html.indexOf('</nav>'))
    for (const href of ['"/"', '"/agents"', '"/ailments"', '"/therapies"', '"/dashboard"'])
      expect(nav).toContain(`href=${href}`)
  })
})

describe('end to end', () => {
  it('book an appointment, see it on the dashboard, and complete it', async () => {
    const openCount = async () => {
      const { html } = await get('/dashboard')
      const m = /Open appointments/.exec(html)
      expect(m).not.toBeNull()
      // counts are rendered as <h2 class="count">N</h2><p>Label</p>
      const found = /<h2 class="count">(\d+)<\/h2>\s*<p>Open appointments<\/p>/.exec(html)
      return Number(found![1])
    }

    expect(await openCount()).toBe(0)

    const agent = firstAgentId()
    expect((await get(`/agents/${agent}`)).res.status).toBe(200)
    expect((await get(`/agents/${agent}/book`)).res.status).toBe(200)

    const { res } = await book(agent)
    expect(res.status).toBe(303)
    const confirmation = await get(res.headers.get('location')!)
    expect(confirmation.res.status).toBe(200)
    expect(confirmation.html).toContain('Appointment confirmed')

    expect(await openCount()).toBe(1)

    const id = db.prepare('SELECT id FROM appointments').pluck().get()
    expect((await post(`/appointments/${id}/status`, { status: 'completed' })).res.status).toBe(303)
    expect(await openCount()).toBe(0)
    expect((await get(`/appointments/${id}`)).html).toContain('Completed')
  })
})
