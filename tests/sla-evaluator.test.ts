import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSla } from '../src/governance/sla-evaluator';

test('sla: healthy agent is compliant', () => {
  const result = evaluateSla({ agentId: 'agt_support_triage', windowHours: 24 });
  assert.equal(result.status, 'compliant');
  assert.ok(result.errorBudgetRemainingPct > 0);
});

test('sla: degraded agent is at-risk or breach', () => {
  const result = evaluateSla({ agentId: 'agt_code_review', windowHours: 24 });
  assert.notEqual(result.status, 'compliant');
});

test('sla: quarantined agent is breach', () => {
  const result = evaluateSla({ agentId: 'agt_data_analyst', windowHours: 24 });
  assert.equal(result.status, 'breach');
});
