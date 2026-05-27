import fs from 'fs'
import path from 'path'
import { config } from '../config.js'

function dataFile(dataDir?: string): string {
  return path.join(dataDir ?? config.dataDir, 'budget.json')
}

export function ensureDataDir(dataDir?: string): void {
  const dir = dataDir ?? config.dataDir
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function readState(dataDir?: string): string {
  const file = dataFile(dataDir)
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '{}'
}

export function writeState(data: unknown, dataDir?: string): void {
  fs.writeFileSync(dataFile(dataDir), JSON.stringify(data), 'utf8')
}
