import type { AgentStatus } from '../queries/agents.js'

export const statusLabels: Record<AgentStatus, string> = {
  available: 'Available',
  'in-session': 'In session',
  'needs-rest': 'Needs rest',
}

export function StatusBadge({ status }: { status: AgentStatus }) {
  return <span class={`status status-${status}`}>{statusLabels[status]}</span>
}
