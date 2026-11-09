import type { Db } from '../db.js'

export type DashboardCounts = { agents: number; openAppointments: number; ailmentsInFlight: number }

export function getCounts(db: Db): DashboardCounts {
  const one = (sql: string) => db.prepare(sql).pluck().get() as number
  return {
    agents: one('SELECT COUNT(*) FROM agents'),
    // "Open" means still scheduled.
    openAppointments: one("SELECT COUNT(*) FROM appointments WHERE status = 'scheduled'"),
    // "In flight" means linked to at least one agent.
    ailmentsInFlight: one('SELECT COUNT(DISTINCT ailment_id) FROM agent_ailments'),
  }
}
