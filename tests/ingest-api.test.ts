import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RunIngestSchema } from '../src/schemas/validation-schemas';
import { summarizeValidatedRun } from '../src/governance/ingest-summary';

const valid = {
  agentId: 'synthetic-agent', runId: 'synthetic-run', caller: 'test-client',
  environment: 'development', startedAt: '2026-09-29T12:00:00Z',
  spans: [{ spanId: 's1', kind: 'llm', name: 'example', latencyMs: 10, status: 'ok' }],
};

test('ingest summarizes validated input without persistence or evaluation', () => {
  const parsed = RunIngestSchema.parse(valid);
  const summary = summarizeValidatedRun(parsed);
  assert.equal(summary.persisted, false);
  assert.equal(summary.evaluated, false);
  assert.equal(summary.spanCount, 1);
  assert.equal(summary.totalLatencyMs, 10);
});

test('ingest schema rejects malformed timestamps and oversized span batches', () => {
  assert.equal(RunIngestSchema.safeParse({ ...valid, startedAt: 'not-a-date' }).success, false);
  const rejected = RunIngestSchema.safeParse({
    ...valid, spans: Array.from({ length: 501 }, (_, i) => ({ ...valid.spans[0], spanId: `s${i}` })),
  });
  assert.equal(rejected.success, false);
});
