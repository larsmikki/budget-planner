import { Router } from 'express'
import { ensureDataDir, readState, writeState } from '../db/storage.js'

// Bound to a dataDir so tests can inject a temp directory per app instance.
export function stateRouter(dataDir?: string): Router {
  const router = Router()
  ensureDataDir(dataDir)

  router.get('/state', (_req, res) => {
    res.type('json').send(readState(dataDir))
  })

  router.put('/state', (req, res) => {
    writeState(req.body, dataDir)
    res.json({ ok: true })
  })

  return router
}
