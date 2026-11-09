import type { Db } from './db.js'
import { getTherapist } from './queries/therapists.js'

export const MAX_NOTES = 500

export type BookingInput = { therapist_id?: string; scheduled_at?: string; notes?: string }
export type BookingErrors = Partial<Record<'therapist' | 'scheduled_at' | 'notes', string>>
export type BookingResult =
  | { ok: true; values: { therapistId: number; scheduledAt: string; notes: string } }
  | { ok: false; errors: BookingErrors }

// Accepts "YYYY-MM-DDTHH:MM" (what <input type="datetime-local"> sends) and returns a Date,
// or undefined if it is malformed or not a real calendar date/time.
function parseLocalDateTime(value: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!m) return undefined
  const [y, mo, d, h, mi] = m.slice(1).map(Number)
  const date = new Date(y, mo - 1, d, h, mi)
  const valid =
    date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d &&
    date.getHours() === h && date.getMinutes() === mi
  return valid ? date : undefined
}

export function validateBooking(input: BookingInput, db: Db, now = new Date()): BookingResult {
  const errors: BookingErrors = {}

  const therapistRaw = (input.therapist_id ?? '').trim()
  const therapistId = /^\d+$/.test(therapistRaw) ? Number(therapistRaw) : undefined
  if (therapistId === undefined) errors.therapist = 'Please choose a therapist.'
  else if (!getTherapist(db, therapistId)) errors.therapist = 'That therapist does not exist.'

  const scheduledAt = (input.scheduled_at ?? '').trim()
  if (!scheduledAt) errors.scheduled_at = 'Please choose a date and time.'
  else {
    const date = parseLocalDateTime(scheduledAt)
    if (!date) errors.scheduled_at = 'Please enter a valid date and time.'
    else if (date.getTime() <= now.getTime()) errors.scheduled_at = 'The appointment must be in the future.'
  }

  const notes = (input.notes ?? '').trim()
  if (notes.length > MAX_NOTES) errors.notes = `Notes must be at most ${MAX_NOTES} characters.`

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, values: { therapistId: therapistId!, scheduledAt, notes } }
}
