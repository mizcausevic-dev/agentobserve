import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { agentsRouter, runsRouter, incidentsRouter, dashboardRouter } from './routes/agents.js';
import { ingestRouter, evaluateRouter } from './routes/evaluate.js';
import { openApiSpec } from './docs/swagger.js';

export const app = express();
const startedAt = Date.now();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'agentobserve',
    version: '0.1.0',
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    nodeEnv: env.nodeEnv,
  });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use('/api/agents', agentsRouter);
app.use('/api/runs', runsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/ingest', ingestRouter);
app.use('/api/evaluate', evaluateRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'not-found' });
});

if (require.main === module) {
  app.listen(env.port, () => {
    console.log(`[agentobserve] listening on http://localhost:${env.port}`);
    console.log(`[agentobserve] swagger docs at http://localhost:${env.port}/docs`);
  });
}
