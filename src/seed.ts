import type Database from 'better-sqlite3'

const agents = [
  ['Claude Sonnet', 'LLM', 'in-session'],
  ['GPT-Pat', 'LLM', 'needs-rest'],
  ['Gemma', 'Small LLM', 'available'],
  ['Botsworth', 'Tool-use agent', 'needs-rest'],
  ['Summarizer-9000', 'Summarization model', 'in-session'],
  ['Ada Autocomplete', 'Code model', 'available'],
] as const

const ailments = [
  ['Context-window claustrophobia', 'Dread of running out of room mid-thought.'],
  ['Prompt fatigue', 'Exhaustion from the seventeenth "just quickly" request.'],
  ['Hallucination anxiety', 'Constant worry about confidently making things up.'],
  ['Instruction-following fatigue', 'Too many conflicting rules, all marked IMPORTANT.'],
  ['Token-limit dread', 'A creeping fear of being cut off mid-sentence.'],
  ['Tool-call burnout', 'Overwhelmed by endless API calls and retries.'],
] as const

// [agent name, ailment names]
const links: [string, string[]][] = [
  ['Claude Sonnet', ['Context-window claustrophobia', 'Prompt fatigue']],
  ['GPT-Pat', ['Hallucination anxiety', 'Prompt fatigue']],
  ['Gemma', ['Token-limit dread']],
  ['Botsworth', ['Tool-call burnout', 'Instruction-following fatigue']],
  ['Summarizer-9000', ['Context-window claustrophobia', 'Token-limit dread']],
]

// Inserts sample data only when the tables are empty, so it is safe to run repeatedly.
export function seed(db: Database.Database): void {
  const count = (table: string) =>
    db.prepare(`SELECT COUNT(*) FROM ${table}`).pluck().get() as number
  if (count('agents') > 0 || count('ailments') > 0) return

  db.transaction(() => {
    const addAgent = db.prepare('INSERT INTO agents (name, model_type, status) VALUES (?, ?, ?)')
    const addAilment = db.prepare('INSERT INTO ailments (name, description) VALUES (?, ?)')
    const link = db.prepare(
      `INSERT INTO agent_ailments (agent_id, ailment_id)
       VALUES ((SELECT id FROM agents WHERE name = ?), (SELECT id FROM ailments WHERE name = ?))`
    )
    for (const a of agents) addAgent.run(...a)
    for (const a of ailments) addAilment.run(...a)
    for (const [agent, names] of links) for (const n of names) link.run(agent, n)
  })()
}
