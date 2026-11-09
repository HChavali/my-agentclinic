import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type Database from 'better-sqlite3'

const migrationsDir = fileURLToPath(new URL('../migrations', import.meta.url))

// Applies each migrations/*.sql file once, in filename order.
export function migrate(db: Database.Database): void {
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY)')
  const applied = new Set(
    db.prepare('SELECT name FROM schema_migrations').pluck().all() as string[]
  )
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
  for (const file of files) {
    if (applied.has(file)) continue
    const sql = readFileSync(`${migrationsDir}/${file}`, 'utf8')
    db.transaction(() => {
      db.exec(sql)
      db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file)
    })()
  }
}
