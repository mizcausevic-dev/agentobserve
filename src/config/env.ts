import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  costAnomalyThreshold: parseFloat(process.env.COST_ANOMALY_THRESHOLD ?? '2.5'),
  costBudgetWarnPct: parseFloat(process.env.COST_BUDGET_WARN_PCT ?? '0.80'),
  costBudgetBlockPct: parseFloat(process.env.COST_BUDGET_BLOCK_PCT ?? '1.00'),
  latencyRegressionThreshold: parseFloat(process.env.LATENCY_REGRESSION_THRESHOLD ?? '1.5'),
  outputDriftThreshold: parseFloat(process.env.OUTPUT_DRIFT_THRESHOLD ?? '0.30'),
  loopDetectionMaxRepeats: parseInt(process.env.LOOP_DETECTION_MAX_REPEATS ?? '4', 10),
  slaDefaultLatencyP95Ms: parseInt(process.env.SLA_DEFAULT_LATENCY_P95_MS ?? '8000', 10),
  slaDefaultSuccessRate: parseFloat(process.env.SLA_DEFAULT_SUCCESS_RATE ?? '0.95'),
  alertWebhookUrl: process.env.ALERT_WEBHOOK_URL ?? '',
};
