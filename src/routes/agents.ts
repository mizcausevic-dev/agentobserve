import { Router } from 'express';
import { agents, findAgent } from '../data/agents';
import { runs, incidents, baselines } from '../data/runs';

export const agentsRouter = Router();
agentsRouter.get('/', (_req, res) => {
  res.json({
    count: agents.length,
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
      environment: a.environment,
      status: a.status,
      primaryModel: a.primaryModel,
      runs24h: a.runs24h,
      cost24hUsd: a.cost24hUsd,
      costPerRunUsd: a.costPerRunUsd,
      p95LatencyMs: a.p95LatencyMs,
      successRate: a.successRate,
      slaCompliance: a.slaCompliance,
      postureScore: a.postureScore,
      lastRunAt: a.lastRunAt,
    })),
  });
});

agentsRouter.get('/:id', (req, res) => {
  const agent = findAgent(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'agent-not-found', agentId: req.params.id });
  }
  return res.json(agent);
});

agentsRouter.get('/:id/baseline', (req, res) => {
  const agent = findAgent(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'agent-not-found' });
  }
  const baseline = baselines.find((b) => b.agentId === agent.id);
  if (!baseline) {
    return res.status(404).json({ error: 'baseline-not-computed', agentId: agent.id });
  }
  return res.json(baseline);
});

export const runsRouter = Router();
runsRouter.get('/', (_req, res) => {
  res.json({
    count: runs.length,
    runs: runs.map((r) => ({
      id: r.id,
      agentId: r.agentId,
      caller: r.caller,
      environment: r.environment,
      startedAt: r.startedAt,
      totalLatencyMs: r.totalLatencyMs,
      totalCostUsd: r.totalCostUsd,
      toolCallCount: r.toolCallCount,
      retryCount: r.retryCount,
      status: r.status,
      decision: r.decision,
      postureScore: r.postureScore,
    })),
  });
});

runsRouter.get('/:id', (req, res) => {
  const run = runs.find((r) => r.id === req.params.id);
  if (!run) {
    return res.status(404).json({ error: 'run-not-found', runId: req.params.id });
  }
  return res.json(run);
});

export const incidentsRouter = Router();
incidentsRouter.get('/', (_req, res) => {
  res.json({ count: incidents.length, incidents });
});

export const dashboardRouter = Router();
dashboardRouter.get('/summary', (_req, res) => {
  const totalAgents = agents.length;
  const healthy = agents.filter((a) => a.status === 'healthy').length;
  const degraded = agents.filter((a) => a.status === 'degraded').length;
  const quarantined = agents.filter((a) => a.status === 'quarantined').length;
  const totalRuns24h = agents.reduce((acc, a) => acc + a.runs24h, 0);
  const totalCost24h = agents.reduce((acc, a) => acc + a.cost24hUsd, 0);
  const sortedP95 = [...agents].sort((a, b) => b.p95LatencyMs - a.p95LatencyMs);
  const fleetP95 = sortedP95[0]?.p95LatencyMs ?? 0;
  const avgPosture = Math.round(agents.reduce((acc, a) => acc + a.postureScore, 0) / Math.max(1, totalAgents));
  const fleetSla = agents.reduce((acc, a) => acc + a.slaCompliance, 0) / Math.max(1, totalAgents);
  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length;

  res.json({
    fleet: {
      totalAgents,
      healthy,
      degraded,
      quarantined,
      avgPostureScore: avgPosture,
      slaCompliancePct: Math.round(fleetSla * 100),
    },
    traffic: {
      runs24h: totalRuns24h,
      cost24hUsd: Math.round(totalCost24h * 100) / 100,
      fleetP95LatencyMs: fleetP95,
    },
    incidents: {
      total: incidents.length,
      open: openIncidents,
      bySeverity: {
        critical: incidents.filter((i) => i.severity === 'critical').length,
        high: incidents.filter((i) => i.severity === 'high').length,
        medium: incidents.filter((i) => i.severity === 'medium').length,
        low: incidents.filter((i) => i.severity === 'low').length,
      },
    },
    generatedAt: new Date().toISOString(),
  });
});
