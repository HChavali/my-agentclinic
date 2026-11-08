import { describe, expect, it } from 'vitest'
import { app } from '../src/app.js'

describe('app', () => {
  it('GET / renders the home page', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('AgentClinic')
    expect(html).toContain('<header')
    expect(html).toContain('<nav')
    expect(html).toContain('<footer')
    expect(html).toContain('href="/styles.css"')
  })

  it('GET /nope returns 404', async () => {
    const res = await app.request('/nope')
    expect(res.status).toBe(404)
  })
})
