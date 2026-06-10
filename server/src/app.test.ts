import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { createApp } from './app.js'

let dataDir: string

beforeAll(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'))
})

afterAll(() => {
  fs.rmSync(dataDir, { recursive: true, force: true })
})

// ---------------------------------------------------------------------------
// API endpoints
// ---------------------------------------------------------------------------
describe('GET /api/health', () => {
  it('returns 200 { ok: true }', async () => {
    const app = createApp({ dataDir })
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })
})

describe('GET /api/state', () => {
  it('returns {} when no data file exists', async () => {
    const app = createApp({ dataDir })
    const res = await request(app).get('/api/state')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({})
  })
})

describe('PUT /api/state + GET /api/state', () => {
  it('saves state and retrieves it', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rw-'))
    try {
      const app = createApp({ dataDir: dir })
      const state = { year: 2025, sections: [{ id: 's1', name: 'Income', type: 'income' }], posts: [], collapsed: {}, settings: {} }

      const put = await request(app).put('/api/state').send(state)
      expect(put.status).toBe(200)
      expect(put.body).toEqual({ ok: true })

      const get = await request(app).get('/api/state')
      expect(get.status).toBe(200)
      expect(get.body).toMatchObject({ year: 2025 })
      expect(get.body.sections[0].name).toBe('Income')
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ---------------------------------------------------------------------------
// Production static serving — catches wrong client/dist path
// ---------------------------------------------------------------------------
describe('Production static serving', () => {
  let clientDist: string
  const original = process.env['NODE_ENV']

  beforeAll(() => {
    clientDist = fs.mkdtempSync(path.join(os.tmpdir(), 'dist-'))
    fs.writeFileSync(path.join(clientDist, 'index.html'), '<html><body>It works</body></html>')
    process.env['NODE_ENV'] = 'production'
  })

  afterAll(() => {
    process.env['NODE_ENV'] = original
    fs.rmSync(clientDist, { recursive: true, force: true })
  })

  it('GET / serves index.html', async () => {
    const app = createApp({ dataDir, clientDist })
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toContain('It works')
  })

  it('GET /any-spa-route falls back to index.html', async () => {
    const app = createApp({ dataDir, clientDist })
    const res = await request(app).get('/settings')
    expect(res.status).toBe(200)
    expect(res.text).toContain('It works')
  })

  it('GET /api/health still works in production mode', async () => {
    const app = createApp({ dataDir, clientDist })
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })
})
