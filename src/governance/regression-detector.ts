import { env } from '../config/env';
import { baselines, runs } from '../data/runs';
import { findAgent } from '../data/agents';
import type { RegressionEvaluationPayload, Span } from '../schemas/validation-schemas';

export interface RegressionResult {
  agentId: string;
  runId: string;
  status: 'allowed' | 'flagged' | 'blocked';
  postureScore: number;
  latencyMultiplier: number;
  outputDriftScore: number;
  toolLoopDetected: boolean;
  retriesExcessive: boolean;
  issues: string[];
  passedChecks: string[];
  recommendedNextAction: string;
}

function detectToolLoop(spans: Span[], maxRepeats: number): { tool: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const s of spans) {
    if (s.kind === 'tool') {
      const c = (counts.get(s.name) ?? 0) + 1;
      counts.set(s.name, c);
      if (c > maxRepeats) return { tool: s.name, count: c };
    }
  }
  return null;
}

export function evaluateRunRegression(payload: RegressionEvaluationPayload): RegressionResult {
  const agent = findAgent(payload.agentId);
  const run = runs.find((r) => r.id === payload.runId && (r.agentId === payload.agentId || agent?.id === r.agentId));

  const issues: string[] = [];
  const passed: string[] = [];

  if (!agent || !run) {
    return {
      agentId: payload.agentId,
      runId: payload.runId,
      status: 'flagged',
      postureScore: 0,
      latencyMultiplier: 0,
      outputDriftScore: 0,
      toolLoopDetected: false,
      retriesExcessive: false,
      issues: ['Agent or run not found.'],
      passedChecks: [],
      recommendedNextAction: 'Verify agentId and runId are correct.',
    };
  }

  const baseline = baselines.find((b) => b.agentId === agent.id);
  let score = 100;

  // Latency regression
  const latencyP95 = baseline?.latencyP95Ms ?? agent.p95LatencyMs;
  const latencyMultiplier = latencyP95 > 0 ? run.totalLatencyMs / latencyP95 : 0;
  if (latencyMultiplier >= env.latencyRegressionThreshold) {
    issues.push(
      `Run latency ${run.totalLatencyMs}ms is ${latencyMultiplier.toFixed(1)}x baseline P95 (${latencyP95}ms).`
    );
    score -= 25;
  } else {
    passed.push(`Latency within ${latencyMultiplier.toFixed(1)}x of baseline P95.`);
  }

  // Output drift (length z-score proxy)
  let outputDrift = 0;
  if (baseline && baseline.outputLengthStdDev > 0) {
    const z = Math.abs(run.outputLengthChars - baseline.outputLengthMeanChars) / baseline.outputLengthStdDev;
    outputDrift = Math.min(1, z / 3);
    if (outputDrift >= env.outputDriftThreshold) {
      issues.push(
        `Output length ${run.outputLengthChars} chars deviates from baseline mean ${baseline.outputLengthMeanChars} (drift score ${outputDrift.toFixed(2)}).`
      );
      score -= 12;
    } else {
      passed.push(`Output length within expected distribution.`);
    }
  }

  // Tool loop detection
  const loop = detectToolLoop(run.spans, env.loopDetectionMaxRepeats);
  const toolLoopDetected = loop !== null;
  if (loop) {
    issues.push(
      `Tool loop detected: ${loop.tool} called ${loop.count} times (threshold ${env.loopDetectionMaxRepeats}).`
    );
    score -= 18;
  } else {
    passed.push(`No tool-call loops detected.`);
  }

  // Retry excess
  const retriesExcessive = run.retryCount >= 3;
  if (retriesExcessive) {
    issues.push(`Retry count ${run.retryCount} suggests prompt regression or upstream tool instability.`);
    score -= 15;
  } else if (run.retryCount > 0) {
    passed.push(`Retries present (${run.retryCount}) but within tolerance.`);
  } else {
    passed.push(`Zero retries — clean run.`);
  }

  // Status
  if (run.status !== 'ok') {
    issues.push(`Run terminal status was "${run.status}" rather than "ok".`);
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  let status: 'allowed' | 'flagged' | 'blocked';
  let recommendedNextAction: string;

  if (score >= 80) {
    status = 'allowed';
    recommendedNextAction = 'No regression; continue routine sampling.';
  } else if (score >= 55) {
    status = 'flagged';
    recommendedNextAction = 'Open regression ticket for owner; sample 10 more runs in next window.';
  } else {
    status = 'blocked';
    recommendedNextAction = 'Block agent from new traffic; route to owner and platform on-call.';
  }

  return {
    agentId: agent.id,
    runId: run.id,
    status,
    postureScore: score,
    latencyMultiplier: Math.round(latencyMultiplier * 100) / 100,
    outputDriftScore: Math.round(outputDrift * 100) / 100,
    toolLoopDetected,
    retriesExcessive,
    issues,
    passedChecks: passed,
    recommendedNextAction,
  };
}
