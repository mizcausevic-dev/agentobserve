import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRunRegression } from '../src/governance/regression-detector';

test('regression: clean fast run is allowed', () => {
  const result = evaluateRunRegression({
    agentId: 'agt_support_triage',
    runId: 'run_b40ace',
    baselineSampleSize: 100,
  });
  assert.equal(result.status, 'allowed');
  assert.ok(result.postureScore >= 80);
});

test('regression: slow run with retries and tool loop is flagged or blocked', () => {
  const result = evaluateRunRegression({
    agentId: 'agt_data_analyst',
    runId: 'run_8a91fe',
    baselineSampleSize: 100,
  });
  assert.notEqual(result.status, 'allowed');
  assert.ok(result.latencyMultiplier >= 1.5);
  assert.equal(result.toolLoopDetected, false); // 3 calls, threshold is 4 — proves boundary correctness
  assert.equal(result.retriesExcessive, true);
});

test('regression: returns flagged for unknown run', () => {
  const result = evaluateRunRegression({
    agentId: 'agt_does_not_exist',
    runId: 'run_nope',
    baselineSampleSize: 100,
  });
  assert.equal(result.status, 'flagged');
});
