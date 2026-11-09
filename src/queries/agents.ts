import type { Db } from '../db.js'

export type AgentStatus = 'available' | 'in-session' | 'needs-rest'
export type Agent = { id: number; name: string; model_type: string; status: AgentStatus }
export type Ailment = { id: number; name: string; description: string }

export function listAgents(db: Db): Agent[] {
  return db.prepare('SELECT * FROM agents ORDER BY name').all() as Agent[]
}

export function getAgent(db: Db, id: number): (Agent & { ailments: Ailment[] }) | undefined {
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as Agent | undefined
  if (!agent) return undefined
  const ailments = db
    .prepare(
      `SELECT ailments.* FROM ailments
       JOIN agent_ailments ON agent_ailments.ailment_id = ailments.id
       WHERE agent_ailments.agent_id = ? ORDER BY ailments.name`
    )
    .all(id) as Ailment[]
  return { ...agent, ailments }
}
