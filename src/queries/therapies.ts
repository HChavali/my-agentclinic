import type { Db } from '../db.js'

export type Therapy = { id: number; name: string; description: string }

export function listTherapies(db: Db): Therapy[] {
  return db.prepare('SELECT * FROM therapies ORDER BY name').all() as Therapy[]
}

export function therapiesForAilment(db: Db, ailmentId: number): Therapy[] {
  return db
    .prepare(
      `SELECT therapies.* FROM therapies
       JOIN ailment_therapies ON ailment_therapies.therapy_id = therapies.id
       WHERE ailment_therapies.ailment_id = ? ORDER BY therapies.name`
    )
    .all(ailmentId) as Therapy[]
}

// Distinct therapies recommended for any of the agent's ailments.
export function therapiesForAgent(db: Db, agentId: number): Therapy[] {
  return db
    .prepare(
      `SELECT DISTINCT therapies.* FROM therapies
       JOIN ailment_therapies ON ailment_therapies.therapy_id = therapies.id
       JOIN agent_ailments ON agent_ailments.ailment_id = ailment_therapies.ailment_id
       WHERE agent_ailments.agent_id = ? ORDER BY therapies.name`
    )
    .all(agentId) as Therapy[]
}
