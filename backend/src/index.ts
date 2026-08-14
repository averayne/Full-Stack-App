import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `level=request method=${req.method} path=${req.path} status=${res.statusCode} duration_ms=${durationMs}`
    );
  });

  next();
});

const sampleData = [
  { id: 1, name: 'Frontend', value: 'React client connected to the API' },
  { id: 2, name: 'Backend', value: 'Express service responding on /api' },
  { id: 3, name: 'Database', value: 'Configure PostgreSQL environment variables to use live data' }
];

const hasDatabaseConfig = Boolean(
  process.env.DB_USER &&
    process.env.DB_HOST &&
    process.env.DB_NAME &&
    process.env.DB_PASSWORD
);

const pool = hasDatabaseConfig
  ? new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number.parseInt(process.env.DB_PORT || '5432', 10)
    })
  : null;

app.get('/api/message', (_req, res) => {
  res.json({ text: 'Hello from the backend!' });
});

app.get('/api/data', async (_req, res) => {
  if (!pool) {
    res.json(sampleData);
    return;
  }

  try {
    const result = await pool.query('SELECT * FROM sample_data');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

const port = Number.parseInt(process.env.PORT || '3001', 10);
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
