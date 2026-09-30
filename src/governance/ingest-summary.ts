import type { RunIngest } from '../schemas/validation-schemas';

export function summarizeValidatedRun(run: RunIngest) {
  const totalCost = run.spans.reduce((acc, span) => acc + (span.costUsd ?? 0), 0);
  const totalLatency = run.spans.reduce((acc, span) => acc + span.latencyMs, 0);
  return {
    accepted: true,
    mode: 'validation-only',
    persisted: false,
    evaluated: false,
    runId: run.runId,
    agentId: run.agentId,
    spanCount: run.spans.length,
    totalCostUsd: Math.round(totalCost * 10000) / 10000,
    totalLatencyMs: totalLatency,
  };
}
