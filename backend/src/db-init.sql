CREATE TABLE IF NOT EXISTS sample_data (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sample_data (name, value)
VALUES
  ('Frontend', 'React client connected to the API'),
  ('Backend', 'Express service responding on /api'),
  ('Database', 'PostgreSQL sample_data table initialized')
ON CONFLICT DO NOTHING;
