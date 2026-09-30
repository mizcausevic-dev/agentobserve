import { runs } from '../data/runs';
import { evaluateRunRegression } from './regression-detector';
import { evaluateCostAnomaly } from './cost-anomaly';

export interface RunAuditResult {
  runId: string;
  agentId: string;
  combinedStatus: 'no-findings' | 'needs-review' | 'blocked';
  postureScore: number;
  regression: ReturnType<typeof evaluateRunRegression>;
  cost: ReturnType<typeof evaluateCostAnomaly>;
  issues: string[];
  recommendedNextAction: string;
}

export function auditRun(runId: string): RunAuditResult | null {
  const run = runs.find((r) => r.id === runId);
  if (!run) return null;

  const regression = evaluateRunRegression({ agentId: run.agentId, runId: run.id, baselineSampleSize: 100 });
  const cost = evaluateCostAnomaly({ agentId: run.agentId, runCostUsd: run.totalCostUsd, windowDays: 7 });

  const issues = [...regression.issues, ...cost.issues];
  const score = Math.round((regression.postureScore + (cost.status === 'allowed' ? 100 : cost.status === 'flagged' ? 60 : 30)) / 2);

  let combinedStatus: 'no-findings' | 'needs-review' | 'blocked';
  if (regression.status === 'allowed' && cost.status === 'allowed') {
    combinedStatus = 'no-findings';
  } else if (regression.status === 'blocked' || cost.status === 'blocked') {
    combinedStatus = 'blocked';
  } else {
    combinedStatus = 'needs-review';
  }

  let recommendedNextAction: string;
  if (combinedStatus === 'no-findings') {
    recommendedNextAction = 'No anomaly in this fixture run; review other controls before use.';
  } else if (combinedStatus === 'needs-review') {
    recommendedNextAction = 'Notify agent owner; sample additional runs in next window.';
  } else {
    recommendedNextAction = 'Do not promote this fixture run; investigate the flagged regression and cost signals.';
  }

  return {
    runId: run.id,
    agentId: run.agentId,
    combinedStatus,
    postureScore: score,
    regression,
    cost,
    issues,
    recommendedNextAction,
  };
}
