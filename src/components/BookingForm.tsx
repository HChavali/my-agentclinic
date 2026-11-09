import type { Therapist } from '../queries/therapists.js'
import type { BookingErrors } from '../validation.js'
import { MAX_NOTES } from '../validation.js'

export type BookingValues = { therapist_id: string; scheduled_at: string; notes: string }

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <small id={id}>{message}</small> : null
}

export function BookingForm(props: {
  agentId: number
  therapists: Therapist[]
  values: BookingValues
  errors: BookingErrors
}) {
  const { agentId, therapists, values, errors } = props
  return (
    <form method="post" action={`/agents/${agentId}/appointments`}>
      <label>
        Therapist
        <select
          name="therapist_id"
          required
          aria-invalid={errors.therapist ? 'true' : undefined}
          aria-describedby={errors.therapist ? 'therapist-error' : undefined}
        >
          <option value="">Choose a therapist…</option>
          {therapists.map((t) => (
            <option value={String(t.id)} selected={String(t.id) === values.therapist_id}>
              {t.name} — {t.specialty}
            </option>
          ))}
        </select>
        <FieldError id="therapist-error" message={errors.therapist} />
      </label>

      <label>
        Date and time
        <input
          type="datetime-local"
          name="scheduled_at"
          required
          value={values.scheduled_at}
          aria-invalid={errors.scheduled_at ? 'true' : undefined}
          aria-describedby={errors.scheduled_at ? 'scheduled-at-error' : undefined}
        />
        <FieldError id="scheduled-at-error" message={errors.scheduled_at} />
      </label>

      <label>
        Notes (optional)
        <textarea
          name="notes"
          rows={4}
          maxlength={MAX_NOTES}
          aria-invalid={errors.notes ? 'true' : undefined}
          aria-describedby={errors.notes ? 'notes-error' : undefined}
        >
          {values.notes}
        </textarea>
        <FieldError id="notes-error" message={errors.notes} />
      </label>

      <button type="submit">Book appointment</button>
    </form>
  )
}
