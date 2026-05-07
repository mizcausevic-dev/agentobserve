import { env } from '../config/env.js';
import { baselines } from '../data/runs.js';
import { findAgent } from '../data/agents.js';
import type { CostAnomalyEvaluationPayload } from '../schemas/validation-schemas.js';

export interface CostAnomalyResult {
  agentId: string;
  status: 'allowed' | 'flagged' | 'blocked';
  runCostUsd: number;
  baselineP95Usd: number;
  costMultiplier: number;
  budgetUtilizationPct: number;
  issues: string[];
  passedChecks: string[];
  recommendedNextAction: string;
}

export function evaluateCostAnomaly(payload: CostAnomalyEvaluationPayload): CostAnomalyResult {
  const agent = findAgent(payload.agentId);
  const baseline = baselines.find((b) => b.agentId === payload.agentId);

  const issues: string[] = [];
  const passed: string[] = [];

  if (!agent) {
    return {
      agentId: payload.agentId,
      status: 'flagged',
      runCostUsd: payload.runCostUsd,
      baselineP95Usd: 0,
      costMultiplier: 0,
      budgetUtilizationPct: 0,
      issues: [`Agent ${payload.agentId} is not registered.`],
      passedChecks: [],
      recommendedNextAction: 'Register agent before submitting run cost evaluations.',
    };
  }

  const baselineP95 = baseline?.costP95Usd ?? agent.costPerRunUsd * 1.4;
  const multiplier = baselineP95 > 0 ? payload.runCostUsd / baselineP95 : 0;
  const projectedSpend = agent.monthlySpendUsd + payload.runCostUsd;
  const budgetPct = projectedSpend / agent.monthlyBudgetUsd;

  if (multiplier >= env.costAnomalyThreshold) {
    issues.push(
      `Run cost $${payload.runCostUsd.toFixed(4)} is ${multiplier.toFixed(1)}x the agent baseline P95 of $${baselineP95.toFixed(4)}.`
    );
  } else if (multiplier >= 1.5) {
    issues.push(
      `Run cost $${payload.runCostUsd.toFixed(4)} is ${multiplier.toFixed(1)}x the agent baseline P95.`
    );
  } else {
    passed.push(`Run cost within ${multiplier.toFixed(1)}x of baseline P95.`);
  }

  if (budgetPct >= env.costBudgetBlockPct) {
    issues.push(
      `Monthly spend $${projectedSpend.toFixed(2)} would exceed budget $${agent.monthlyBudgetUsd.toFixed(2)} (${(budgetPct * 100).toFixed(0)}%).`
    );
  } else if (budgetPct >= env.costBudgetWarnPct) {
    issues.push(
      `Monthly spend at ${(budgetPct * 100).toFixed(0)}% of budget; warn threshold reached.`
    );
  } else {
    passed.push(`Monthly spend at ${(budgetPct * 100).toFixed(0)}% of budget; healthy.`);
  }

  let status: 'allowed' | 'flagged' | 'blocked';
  let recommendedNextAction: string;

  if (multiplier >= env.costAnomalyThreshold || budgetPct >= env.costBudgetBlockPct) {
    status = 'blocked';
    recommendedNextAction = 'Block further runs for this agent until owner approves budget increase or root-cause is fixed.';
  } else if (multiplier >= 1.5 || budgetPct >= env.costBudgetWarnPct) {
    status = 'flagged';
    recommendedNextAction = 'Notify agent owner; review prompt and tool usage for regression.';
  } else {
    status = 'allowed';
    recommendedNextAction = 'Allow run; continue routine cost tracking.';
  }

  return {
    agentId: agent.id,
    status,
    runCostUsd: payload.runCostUsd,
    baselineP95Usd: baselineP95,
    costMultiplier: Math.round(multiplier * 100) / 100,
    budgetUtilizationPct: Math.round(budgetPct * 100),
    issues,
    passedChecks: passed,
    recommendedNextAction,
  };
}
