import { useEffect, useMemo, useState } from 'react';

interface MessageResponse {
  text: string;
}

interface SampleRecord {
  id: number;
  name: string;
  value: string;
  created_at?: string;
}

const fallbackData: SampleRecord[] = [
  { id: 1, name: 'Frontend', value: 'React app deployed to S3 static website hosting' },
  { id: 2, name: 'Backend', value: 'Express API running from a Docker container on EC2' },
  { id: 3, name: 'Database', value: 'RDS PostgreSQL provisioned in private subnets' }
];

function App() {
  const apiUrl = useMemo(
    () => import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    []
  );
  const [message, setMessage] = useState('');
  const [data, setData] = useState<SampleRecord[]>(fallbackData);
  const [status, setStatus] = useState('Loading backend status...');

  useEffect(() => {
    const load = async () => {
      try {
        const healthResponse = await fetch(`${apiUrl}/health`);
        const health = await healthResponse.json();
        setStatus(`Backend status: ${health.status}`);

        const messageResponse = await fetch(`${apiUrl}/message`);
        const messageBody = (await messageResponse.json()) as MessageResponse;
        setMessage(messageBody.text);
      } catch (error) {
        setStatus('Backend is not reachable');
        setMessage('Cloud infrastructure is deployed');
        console.error('Error loading application data:', error);
      }

      try {
        const dataResponse = await fetch(`${apiUrl}/data`);
        if (!dataResponse.ok) {
          throw new Error(`Data request failed: ${dataResponse.status}`);
        }
        const records = (await dataResponse.json()) as SampleRecord[];
        if (records.length > 0) {
          setData(records);
        }
      } catch (error) {
        console.error('Using fallback sample data:', error);
      }
    };

    load();
  }, [apiUrl]);

  return (
    <main className="app-shell">
      <section className="summary">
        <p className="eyebrow">Full-stack cloud application</p>
        <h1>Cloud Infrastructure Project</h1>
        <p className="lede">{message || 'Waiting for backend response...'}</p>
        <div className="status-row">
          <span>{status}</span>
          <code>{apiUrl}</code>
        </div>
      </section>

      <section className="data-section" aria-labelledby="database-heading">
        <div>
          <p className="eyebrow">Database</p>
          <h2 id="database-heading">Sample records</h2>
        </div>

        <div className="record-grid">
          {data.map((item) => (
            <article className="record-card" key={item.id}>
              <span>#{item.id}</span>
              <h3>{item.name}</h3>
              <p>{item.value}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
