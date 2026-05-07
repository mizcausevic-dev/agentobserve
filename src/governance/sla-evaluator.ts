import { findAgent } from '../data/agents.js';
import type { SlaEvaluationPayload } from '../schemas/validation-schemas.js';

export interface SlaEvaluationResult {
  agentId: string;
  windowHours: number;
  status: 'compliant' | 'at-risk' | 'breach';
  latencyP95ObservedMs: number;
  latencyP95SlaMs: number;
  latencyCompliancePct: number;
  successRateObserved: number;
  successRateSla: number;
  successRateCompliancePct: number;
  errorBudgetRemainingPct: number;
  issues: string[];
  passedChecks: string[];
  recommendedNextAction: string;
}

export function evaluateSla(payload: SlaEvaluationPayload): SlaEvaluationResult {
  const agent = findAgent(payload.agentId);
  const issues: string[] = [];
  const passed: string[] = [];

  if (!agent) {
    return {
      agentId: payload.agentId,
      windowHours: payload.windowHours,
      status: 'breach',
      latencyP95ObservedMs: 0,
      latencyP95SlaMs: 0,
      latencyCompliancePct: 0,
      successRateObserved: 0,
      successRateSla: 0,
      successRateCompliancePct: 0,
      errorBudgetRemainingPct: 0,
      issues: ['Agent not registered.'],
      passedChecks: [],
      recommendedNextAction: 'Register agent before SLA evaluation.',
    };
  }

  const latencyOk = agent.p95LatencyMs <= agent.slaLatencyP95Ms;
  const successRateOk = agent.successRate >= agent.slaSuccessRate;

  if (latencyOk) {
    passed.push(
      `P95 latency ${agent.p95LatencyMs}ms within SLA ${agent.slaLatencyP95Ms}ms.`
    );
  } else {
    issues.push(
      `P95 latency ${agent.p95LatencyMs}ms exceeds SLA ${agent.slaLatencyP95Ms}ms by ${(((agent.p95LatencyMs - agent.slaLatencyP95Ms) / agent.slaLatencyP95Ms) * 100).toFixed(0)}%.`
    );
  }

  if (successRateOk) {
    passed.push(
      `Success rate ${(agent.successRate * 100).toFixed(1)}% meets SLA ${(agent.slaSuccessRate * 100).toFixed(0)}%.`
    );
  } else {
    issues.push(
      `Success rate ${(agent.successRate * 100).toFixed(1)}% below SLA threshold ${(agent.slaSuccessRate * 100).toFixed(0)}%.`
    );
  }

  // Error budget = (1 - SLA) is allowed; remaining = ((1 - actualErrorRate) - SLA) / (1 - SLA)
  const errorRate = 1 - agent.successRate;
  const errorAllowance = 1 - agent.slaSuccessRate;
  const errorBudgetRemainingPct = errorAllowance > 0
    ? Math.max(0, ((errorAllowance - errorRate) / errorAllowance) * 100)
    : 0;

  let status: 'compliant' | 'at-risk' | 'breach';
  let recommendedNextAction: string;

  if (latencyOk && successRateOk && agent.slaCompliance >= 0.97) {
    status = 'compliant';
    recommendedNextAction = 'Continue routine SLA tracking.';
  } else if (agent.slaCompliance >= 0.90) {
    status = 'at-risk';
    recommendedNextAction = 'Increase sampling and notify agent owner; review recent regressions.';
  } else {
    status = 'breach';
    recommendedNextAction = 'Open incident, notify owner, suspend non-critical traffic.';
  }

  return {
    agentId: agent.id,
    windowHours: payload.windowHours,
    status,
    latencyP95ObservedMs: agent.p95LatencyMs,
    latencyP95SlaMs: agent.slaLatencyP95Ms,
    latencyCompliancePct: latencyOk ? 100 : Math.round((agent.slaLatencyP95Ms / agent.p95LatencyMs) * 100),
    successRateObserved: agent.successRate,
    successRateSla: agent.slaSuccessRate,
    successRateCompliancePct: successRateOk ? 100 : Math.round((agent.successRate / agent.slaSuccessRate) * 100),
    errorBudgetRemainingPct: Math.round(errorBudgetRemainingPct),
    issues,
    passedChecks: passed,
    recommendedNextAction,
  };
}
