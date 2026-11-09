import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { openDb, type Db } from '../src/db.js'
import { migrate } from '../src/migrate.js'
import { seed } from '../src/seed.js'
import { statusLabels } from '../src/components/StatusBadge.js'

let db: Db
let app: ReturnType<typeof createApp>

beforeEach(() => {
  db = openDb(':memory:')
  app = createApp(db, { log: false })
})

const get = async (path: string) => {
  const res = await app.request(path)
  return { res, html: await res.text() }
}

// JSX escapes these characters in text, so escape expected strings the same way.
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const count = (table: string) => db.prepare(`SELECT COUNT(*) FROM ${table}`).pluck().get()

describe('database', () => {
  it('creates the tables and seeds data', () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .pluck()
      .all()
    expect(tables).toEqual(expect.arrayContaining(['agents', 'ailments', 'agent_ailments']))
    expect(count('agents')).toBeGreaterThanOrEqual(5)
    expect(count('ailments')).toBeGreaterThanOrEqual(5)
    expect(count('agent_ailments')).toBeGreaterThan(0)
  })

  it('migrating and seeding twice is safe', () => {
    const tables = ['agents', 'ailments', 'agent_ailments', 'schema_migrations']
    const before = tables.map(count)
    migrate(db)
    seed(db)
    expect(tables.map(count)).toEqual(before)
  })

  it('agent names are unique', () => {
    expect(() =>
      db.prepare("INSERT INTO agents (name, model_type, status) VALUES ('Gemma', 'x', 'available')").run()
    ).toThrow()
  })
})

describe('layout', () => {
  const pages = ['/', '/agents', '/agents/1', '/ailments']

  it.each(pages)('%s starts with a doctype and renders inside the layout', async (path) => {
    const { res, html } = await get(path)
    expect(res.status).toBe(200)
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    for (const tag of ['<header', '<nav', '<main', '<footer']) expect(html).toContain(tag)
    const nav = html.slice(html.indexOf('<nav'), html.indexOf('</nav>'))
    for (const href of ['href="/"', 'href="/agents"', 'href="/ailments"']) expect(nav).toContain(href)
  })

  it('GET / shows the welcome heading', async () => {
    expect((await get('/')).html).toContain('Welcome to AgentClinic')
  })

  it('is responsive: viewport meta, Pico before overrides, container', async () => {
    const { html } = await get('/')
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1"')
    expect(html).toContain('@picocss/pico@2')
    expect(html.indexOf('@picocss/pico')).toBeLessThan(html.indexOf('href="/styles.css"'))
    expect(html).toContain('class="container"')
    expect(html).toMatch(/<header[^>]*class="[^"]*container/)
    expect(html).toMatch(/<footer[^>]*class="[^"]*container/)
  })

  it('serves styles.css as text/css with mobile-first media queries', async () => {
    const res = await app.request('/styles.css')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/css')
    const css = readFileSync('public/styles.css', 'utf8')
    expect(css).toContain('@media (min-width')
    expect(css).not.toMatch(/@media[^{]*max-width/)
  })

  it('GET /nope returns 404', async () => {
    expect((await app.request('/nope')).status).toBe(404)
  })
})

describe('agents', () => {
  it('GET /agents lists every agent with a profile link and status label', async () => {
    const { res, html } = await get('/agents')
    expect(res.status).toBe(200)
    const agents = db.prepare('SELECT id, name, status FROM agents').all() as {
      id: number
      name: string
      status: keyof typeof statusLabels
    }[]
    for (const a of agents) {
      expect(html).toContain(a.name)
      expect(html).toContain(`href="/agents/${a.id}"`)
      expect(html).toContain(statusLabels[a.status])
    }
  })

  it('GET /agents/:id shows each agent profile with its complaints', async () => {
    const agents = db.prepare('SELECT * FROM agents').all() as {
      id: number
      name: string
      model_type: string
      status: keyof typeof statusLabels
    }[]
    for (const a of agents) {
      const { res, html } = await get(`/agents/${a.id}`)
      expect(res.status).toBe(200)
      expect(html).toContain(a.name)
      expect(html).toContain(a.model_type)
      expect(html).toContain(statusLabels[a.status])
      expect(html).toContain('Presenting complaints')
      const ailments = db
        .prepare(
          'SELECT ailments.id, ailments.name FROM ailments JOIN agent_ailments ON ailment_id = ailments.id WHERE agent_id = ?'
        )
        .all(a.id) as { id: number; name: string }[]
      for (const al of ailments) {
        expect(html).toContain(esc(al.name))
        expect(html).toContain(`href="/ailments#ailment-${al.id}"`)
      }
      if (ailments.length === 0) expect(html).toContain('No complaints on file')
    }
  })

  it('an agent with no ailments says so', async () => {
    const id = db
      .prepare('SELECT id FROM agents WHERE id NOT IN (SELECT agent_id FROM agent_ailments) LIMIT 1')
      .pluck()
      .get()
    expect(id).toBeDefined()
    expect((await get(`/agents/${id}`)).html).toContain('No complaints on file')
  })

  it('unknown or non-numeric agent ids return 404', async () => {
    expect((await app.request('/agents/9999')).status).toBe(404)
    expect((await app.request('/agents/abc')).status).toBe(404)
  })
})

describe('ailments', () => {
  it('GET /ailments lists every ailment with its description and an anchor id', async () => {
    const { res, html } = await get('/ailments')
    expect(res.status).toBe(200)
    const rows = db.prepare('SELECT id, name, description FROM ailments').all() as {
      id: number
      name: string
      description: string
    }[]
    for (const a of rows) {
      expect(html).toContain(esc(a.name))
      expect(html).toContain(esc(a.description))
      expect(html).toContain(`id="ailment-${a.id}"`)
    }
  })
})
