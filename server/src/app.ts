import express from 'express'
import compression from 'compression'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import { stateRouter } from './routes/state.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp(opts?: { dataDir?: string; clientDist?: string }) {
  const app = express()

  app.use(compression())
  app.use(cors())
  app.use(morgan('dev'))
  app.use(express.json({ limit: '10mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api', stateRouter(opts?.dataDir))

  // Serve client in production
  if (process.env['NODE_ENV'] === 'production') {
    const dist = opts?.clientDist ?? path.join(__dirname, '../../client/dist')
    app.use(express.static(dist))
    app.get('*', (_req, res) => {
      res.sendFile(path.join(dist, 'index.html'))
    })
  }

  return app
}
