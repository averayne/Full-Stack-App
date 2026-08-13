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

function App() {
  const apiUrl = useMemo(
    () => import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    []
  );
  const [message, setMessage] = useState('');
  const [data, setData] = useState<SampleRecord[]>([]);
  const [status, setStatus] = useState('Loading backend status...');

  useEffect(() => {
    const load = async () => {
      try {
        const [healthResponse, messageResponse, dataResponse] = await Promise.all([
          fetch(`${apiUrl}/health`),
          fetch(`${apiUrl}/message`),
          fetch(`${apiUrl}/data`)
        ]);

        const health = await healthResponse.json();
        const messageBody = (await messageResponse.json()) as MessageResponse;
        const records = (await dataResponse.json()) as SampleRecord[];

        setStatus(`Backend status: ${health.status}`);
        setMessage(messageBody.text);
        setData(records);
      } catch (error) {
        setStatus('Backend is not reachable');
        console.error('Error loading application data:', error);
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
