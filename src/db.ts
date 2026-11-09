import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import { migrate } from './migrate.js'
import { seed } from './seed.js'

export type Db = Database.Database

// Opens a database (a file path or ':memory:'), applies migrations, and seeds sample data.
export function openDb(path = 'data/agentclinic.db'): Db {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const db = new Database(path)
  db.pragma('foreign_keys = ON')
  migrate(db)
  seed(db)
  return db
}
