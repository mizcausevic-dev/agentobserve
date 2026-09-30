import { Router } from 'express';
import {
  RunIngestSchema,
  RegressionEvaluationSchema,
  CostAnomalyEvaluationSchema,
  SlaEvaluationSchema,
} from '../schemas/validation-schemas';
import { evaluateCostAnomaly } from '../governance/cost-anomaly';
import { evaluateRunRegression } from '../governance/regression-detector';
import { evaluateSla } from '../governance/sla-evaluator';
import { auditRun } from '../governance/run-audit';
import { summarizeValidatedRun } from '../governance/ingest-summary';

export const ingestRouter = Router();
ingestRouter.post('/run', (req, res) => {
  const parsed = RunIngestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid-payload', issues: parsed.error.issues });
  }
  return res.status(201).json(summarizeValidatedRun(parsed.data));
});

export const evaluateRouter = Router();

evaluateRouter.post('/regression', (req, res) => {
  const parsed = RegressionEvaluationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid-payload', issues: parsed.error.issues });
  }
  return res.json(evaluateRunRegression(parsed.data));
});

evaluateRouter.post('/cost-anomaly', (req, res) => {
  const parsed = CostAnomalyEvaluationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid-payload', issues: parsed.error.issues });
  }
  return res.json(evaluateCostAnomaly(parsed.data));
});

evaluateRouter.post('/sla', (req, res) => {
  const parsed = SlaEvaluationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid-payload', issues: parsed.error.issues });
  }
  return res.json(evaluateSla(parsed.data));
});

evaluateRouter.post('/run-audit', (req, res) => {
  const runId = req.body?.runId;
  if (!runId || typeof runId !== 'string') {
    return res.status(400).json({ error: 'missing-runId' });
  }
  const result = auditRun(runId);
  if (!result) return res.status(404).json({ error: 'run-not-found', runId });
  return res.json(result);
});
