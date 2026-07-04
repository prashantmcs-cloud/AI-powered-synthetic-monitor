import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { DatabaseRepository } from '@ai-synthetic/database';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const port = process.env.PORT || 8080;

const wss = new WebSocketServer({ port: 8081 });
const clients = new Set<any>();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

function broadcast(event: string, data: any) {
  const message = JSON.stringify({ event, ...data });
  for (const client of clients) {
    if (client.readyState === ws.OPEN) {
      client.send(message);
    }
  }
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

app.get('/api/reports', async (_req, res) => {
  try {
    const reports = await DatabaseRepository.getReports(100);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/reports/:id', async (req, res) => {
  try {
    const runs = await DatabaseRepository.getTestRuns(req.params.id);
    res.json(runs);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/test-runs/:id/artifacts', async (req, res) => {
  try {
    const artifacts = await DatabaseRepository.getArtifacts(req.params.id);
    res.json(artifacts);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/test-runs/:id/root-cause', async (req, res) => {
  try {
    const insight = await DatabaseRepository.getRootCause(req.params.id);
    res.json(insight);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/trigger-test', async (req, res) => {
  const { targetUrl, flows } = req.body;
  const correlationId = crypto.randomUUID();
  
  broadcast('test.triggered', { correlationId, targetUrl, flows });
  res.json({ triggered: true, correlationId });
});

app.listen(port, () => {
  console.log(`API Gateway listening on http://localhost:${port}`);
  console.log(`WebSocket server on ws://localhost:8081`);
});

export { app, broadcast };