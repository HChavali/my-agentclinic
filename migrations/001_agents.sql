CREATE TABLE agents (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  model_type TEXT NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('available', 'in-session', 'needs-rest'))
);
