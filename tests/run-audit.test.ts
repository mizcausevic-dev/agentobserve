import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runs } from '../src/data/runs';
import { auditRun } from '../src/governance/run-audit';

test('run audit reports fixture findings without claiming production readiness or enforcement', () => {
  for (const run of runs) {
    const result = auditRun(run.id);
    assert.ok(result);
    assert.ok(['no-findings', 'needs-review', 'blocked'].includes(result.combinedStatus));
    assert.doesNotMatch(result.recommendedNextAction, /block agent traffic|no action required/i);
  }
});
