// Parses a route id like "12"; returns undefined for anything that is not a plain number.
export function parseId(value: string): number | undefined {
  return /^\d{1,9}$/.test(value) ? Number(value) : undefined
}

// Form fields can be strings or files; we only accept strings.
export function formText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
