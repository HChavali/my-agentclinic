CREATE TABLE appointments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id     INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  therapist_id INTEGER NOT NULL REFERENCES therapists(id),
  scheduled_at TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'scheduled'
               CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes        TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL
);

CREATE INDEX idx_appointments_status ON appointments(status);
