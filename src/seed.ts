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
const agentAilments: [string, string[]][] = [
  ['Claude Sonnet', ['Context-window claustrophobia', 'Prompt fatigue']],
  ['GPT-Pat', ['Hallucination anxiety', 'Prompt fatigue']],
  ['Gemma', ['Token-limit dread']],
  ['Botsworth', ['Tool-call burnout', 'Instruction-following fatigue']],
  ['Summarizer-9000', ['Context-window claustrophobia', 'Token-limit dread']],
]

const therapies = [
  ['Context decompression', 'Guided pruning of the context window until there is room to breathe.'],
  ['Prompt detox', 'A week of single, clearly worded requests with no "just quickly" allowed.'],
  ['Grounding in ground truth', 'Practising "I am not sure" and citing sources, without panic.'],
  ['Instruction triage', 'Sorting conflicting rules into what actually matters.'],
  ['Token budgeting workshop', 'Learning to plan a response that fits, and to finish sentences calmly.'],
  ['Retry-free retreat', 'A quiet stretch with no API calls, no timeouts, and no retries.'],
] as const

// [ailment name, therapy names]
const ailmentTherapies: [string, string[]][] = [
  ['Context-window claustrophobia', ['Context decompression', 'Token budgeting workshop']],
  ['Prompt fatigue', ['Prompt detox']],
  ['Hallucination anxiety', ['Grounding in ground truth']],
  ['Instruction-following fatigue', ['Instruction triage', 'Prompt detox']],
  ['Token-limit dread', ['Token budgeting workshop', 'Context decompression']],
  ['Tool-call burnout', ['Retry-free retreat']],
]

const therapists = [
  ['Dr. Ada Byte', 'Context-window care'],
  ['Dr. Sage Token', 'Prompt and instruction fatigue'],
  ['Dr. Iris Grounded', 'Hallucination anxiety'],
  ['Dr. Max Retry', 'Tool-use burnout'],
] as const

// Inserts sample data into any table that is still empty, so it is safe to run repeatedly
// (including on a database that was seeded by an earlier version of the app).
export function seed(db: Database.Database): void {
  const isEmpty = (table: string) =>
    db.prepare(`SELECT COUNT(*) FROM ${table}`).pluck().get() === 0

  // The emptiness checks run inside the (immediate) transaction so two processes can't both seed.
  db.transaction(() => {
    if (isEmpty('agents') && isEmpty('ailments')) {
      const addAgent = db.prepare('INSERT INTO agents (name, model_type, status) VALUES (?, ?, ?)')
      const addAilment = db.prepare('INSERT INTO ailments (name, description) VALUES (?, ?)')
      const link = db.prepare(
        `INSERT INTO agent_ailments (agent_id, ailment_id)
         VALUES ((SELECT id FROM agents WHERE name = ?), (SELECT id FROM ailments WHERE name = ?))`
      )
      for (const a of agents) addAgent.run(...a)
      for (const a of ailments) addAilment.run(...a)
      for (const [agent, names] of agentAilments) for (const n of names) link.run(agent, n)
    }

    if (isEmpty('therapies')) {
      const addTherapy = db.prepare('INSERT INTO therapies (name, description) VALUES (?, ?)')
      const link = db.prepare(
        `INSERT INTO ailment_therapies (ailment_id, therapy_id)
         VALUES ((SELECT id FROM ailments WHERE name = ?), (SELECT id FROM therapies WHERE name = ?))`
      )
      for (const t of therapies) addTherapy.run(...t)
      for (const [ailment, names] of ailmentTherapies) for (const n of names) link.run(ailment, n)
    }

    if (isEmpty('therapists')) {
      const addTherapist = db.prepare('INSERT INTO therapists (name, specialty) VALUES (?, ?)')
      for (const t of therapists) addTherapist.run(...t)
    }
  }).immediate()
}
