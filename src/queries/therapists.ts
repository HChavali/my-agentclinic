import type { Db } from '../db.js'

export type Therapist = { id: number; name: string; specialty: string }

export function listTherapists(db: Db): Therapist[] {
  return db.prepare('SELECT * FROM therapists ORDER BY name').all() as Therapist[]
}

export function getTherapist(db: Db, id: number): Therapist | undefined {
  return db.prepare('SELECT * FROM therapists WHERE id = ?').get(id) as Therapist | undefined
}
