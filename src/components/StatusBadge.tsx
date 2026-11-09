import type { AgentStatus } from '../queries/agents.js'
import type { AppointmentStatus } from '../queries/appointments.js'

export const statusLabels: Record<AgentStatus | AppointmentStatus, string> = {
  available: 'Available',
  'in-session': 'In session',
  'needs-rest': 'Needs rest',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function StatusBadge({ status }: { status: AgentStatus | AppointmentStatus }) {
  return <span class={`status status-${status}`}>{statusLabels[status]}</span>
}
