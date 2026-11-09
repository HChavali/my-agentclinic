import type { Db } from '../db.js'

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'

export type Appointment = {
  id: number
  agent_id: number
  therapist_id: number
  scheduled_at: string
  status: AppointmentStatus
  notes: string
  created_at: string
}

export type AppointmentDetail = Appointment & { agent_name: string; therapist_name: string }

const detailSql = `
  SELECT appointments.*, agents.name AS agent_name, therapists.name AS therapist_name
  FROM appointments
  JOIN agents ON agents.id = appointments.agent_id
  JOIN therapists ON therapists.id = appointments.therapist_id`

export function createAppointment(
  db: Db,
  a: { agentId: number; therapistId: number; scheduledAt: string; notes: string }
): number {
  const result = db
    .prepare(
      `INSERT INTO appointments (agent_id, therapist_id, scheduled_at, notes, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(a.agentId, a.therapistId, a.scheduledAt, a.notes, new Date().toISOString())
  return Number(result.lastInsertRowid)
}

export function getAppointment(db: Db, id: number): AppointmentDetail | undefined {
  return db.prepare(`${detailSql} WHERE appointments.id = ?`).get(id) as
    | AppointmentDetail
    | undefined
}

export function listAppointments(db: Db): AppointmentDetail[] {
  return db
    .prepare(`${detailSql} ORDER BY appointments.scheduled_at, appointments.id`)
    .all() as AppointmentDetail[]
}

// A scheduled appointment can be completed or cancelled; nothing else may change.
export function canMove(from: AppointmentStatus, to: string): to is AppointmentStatus {
  return from === 'scheduled' && (to === 'completed' || to === 'cancelled')
}

export function updateStatus(db: Db, id: number, status: AppointmentStatus): void {
  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id)
}
