import type { Db } from '../db.js'
import type { Ailment } from './agents.js'

export function listAilments(db: Db): Ailment[] {
  return db.prepare('SELECT * FROM ailments ORDER BY name').all() as Ailment[]
}
