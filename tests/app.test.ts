import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { openDb, type Db } from '../src/db.js'
import { migrate } from '../src/migrate.js'
import { seed } from '../src/seed.js'

let db: Db
let app: ReturnType<typeof createApp>

beforeEach(() => {
  db = openDb(':memory:')
  app = createApp(db)
})

const get = async (path: string) => {
  const res = await app.request(path)
  return { res, html: await res.text() }
}

describe('database', () => {
  it('creates the tables and seeds data', () => {
    const count = (t: string) => db.prepare(`SELECT COUNT(*) FROM ${t}`).pluck().get()
    expect(count('agents')).toBeGreaterThanOrEqual(5)
    expect(count('ailments')).toBeGreaterThanOrEqual(5)
    expect(count('agent_ailments')).toBeGreaterThan(0)
  })

  it('migrating and seeding twice is safe', () => {
    const before = db.prepare('SELECT COUNT(*) FROM agents').pluck().get()
    migrate(db)
    seed(db)
    expect(db.prepare('SELECT COUNT(*) FROM agents').pluck().get()).toBe(before)
  })
})

describe('layout', () => {
  it('GET / renders inside the layout with nav links', async () => {
    const { res, html } = await get('/')
    expect(res.status).toBe(200)
    expect(html).toContain('Welcome to AgentClinic')
    for (const tag of ['<header', '<nav', '<main', '<footer']) expect(html).toContain(tag)
    for (const href of ['href="/"', 'href="/agents"', 'href="/ailments"'])
      expect(html).toContain(href)
  })

  it('is responsive: viewport meta, Pico, container, overrides', async () => {
    const { html } = await get('/')
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1"')
    expect(html).toContain('@picocss/pico@2')
    expect(html).toContain('href="/styles.css"')
    expect(html).toContain('class="container"')
  })

  it('serves styles.css as text/css with mobile-first media queries', async () => {
    const res = await app.request('/styles.css')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/css')
    const css = readFileSync('public/styles.css', 'utf8')
    expect(css).toContain('@media (min-width')
    expect(css).not.toContain('max-width: 40rem')
  })

  it('GET /nope returns 404', async () => {
    expect((await app.request('/nope')).status).toBe(404)
  })
})

describe('agents', () => {
  it('GET /agents lists every agent with a profile link', async () => {
    const { res, html } = await get('/agents')
    expect(res.status).toBe(200)
    const agents = db.prepare('SELECT id, name FROM agents').all() as { id: number; name: string }[]
    for (const a of agents) {
      expect(html).toContain(a.name)
      expect(html).toContain(`href="/agents/${a.id}"`)
    }
  })

  it('GET /agents/:id shows the profile and presenting complaints', async () => {
    const row = db
      .prepare(
        `SELECT agents.id, agents.name, agents.model_type, ailments.name AS ailment
         FROM agents JOIN agent_ailments ON agent_id = agents.id
         JOIN ailments ON ailments.id = ailment_id LIMIT 1`
      )
      .get() as { id: number; name: string; model_type: string; ailment: string }
    const { res, html } = await get(`/agents/${row.id}`)
    expect(res.status).toBe(200)
    expect(html).toContain(row.name)
    expect(html).toContain(row.model_type)
    expect(html).toContain('Presenting complaints')
    expect(html).toContain(row.ailment)
    expect(html).toMatch(/available|in-session|needs-rest/)
  })

  it('unknown or non-numeric agent ids return 404', async () => {
    expect((await app.request('/agents/9999')).status).toBe(404)
    expect((await app.request('/agents/abc')).status).toBe(404)
  })
})

describe('ailments', () => {
  it('GET /ailments lists every ailment with its description', async () => {
    const { res, html } = await get('/ailments')
    expect(res.status).toBe(200)
    const rows = db.prepare('SELECT name, description FROM ailments').all() as {
      name: string
      description: string
    }[]
    for (const a of rows) {
      // JSX escapes quotes, so compare names only plus a description without quotes
      expect(html).toContain(a.name)
    }
    expect(html).toContain('Dread of running out of room mid-thought.')
  })
})
