import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCostAnomaly } from '../src/governance/cost-anomaly';

test('cost-anomaly: cost within baseline is allowed', () => {
  const result = evaluateCostAnomaly({
    agentId: 'agt_support_triage',
    runCostUsd: 0.0040,
    windowDays: 7,
  });
  assert.equal(result.status, 'allowed');
  assert.ok(result.costMultiplier < 1.5);
});

test('cost-anomaly: 5x baseline cost is blocked', () => {
  const result = evaluateCostAnomaly({
    agentId: 'agt_support_triage',
    runCostUsd: 0.05,
    windowDays: 7,
  });
  assert.equal(result.status, 'blocked');
  assert.ok(result.costMultiplier >= 2.5);
});

test('cost-anomaly: agent exceeding monthly budget is blocked', () => {
  const result = evaluateCostAnomaly({
    agentId: 'agt_data_analyst',
    runCostUsd: 0.30,
    windowDays: 7,
  });
  // agt_data_analyst already at 321% of budget in fixtures, so this run should block
  assert.equal(result.status, 'blocked');
  assert.ok(result.budgetUtilizationPct >= 100);
});
