export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'AgentObserve API',
    version: '0.1.0',
    description:
      'Operations console for AI agent fleets — runs, traces, cost budgets, regression detection, SLA scoring, and incident routing.',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Local dev' }],
  paths: {
    '/health': { get: { summary: 'Service health' } },
    '/api/agents': { get: { summary: 'List registered agents in the fleet' } },
    '/api/agents/{id}': { get: { summary: 'Fetch one agent record' } },
    '/api/agents/{id}/baseline': { get: { summary: 'Fetch the rolling baseline metrics for one agent' } },
    '/api/runs': { get: { summary: 'List recent agent runs' } },
    '/api/runs/{id}': { get: { summary: 'Fetch a single run with full trace' } },
    '/api/incidents': { get: { summary: 'List open and recent incidents' } },
    '/api/dashboard/summary': { get: { summary: 'Operations summary view' } },
    '/api/ingest/run': { post: { summary: 'Ingest a finished agent run with spans' } },
    '/api/evaluate/regression': { post: { summary: 'Evaluate one run for latency regression, output drift, and tool loops' } },
    '/api/evaluate/cost-anomaly': { post: { summary: 'Evaluate run cost vs agent baseline P95 and monthly budget' } },
    '/api/evaluate/sla': { post: { summary: 'Evaluate agent SLA compliance over a time window' } },
    '/api/evaluate/run-audit': { post: { summary: 'Run combined posture audit on a run (regression + cost)' } },
  },
};
