import { z } from 'zod';

export const SpanSchema = z.object({
  spanId: z.string().min(1),
  parentSpanId: z.string().optional(),
  kind: z.enum(['llm', 'tool', 'guardrail', 'retrieval', 'router']),
  name: z.string().min(1),
  model: z.string().optional(),
  inputTokens: z.number().min(0).optional().default(0),
  outputTokens: z.number().min(0).optional().default(0),
  costUsd: z.number().min(0).optional().default(0),
  latencyMs: z.number().min(0),
  status: z.enum(['ok', 'error', 'timeout']),
  errorMessage: z.string().max(2000).optional(),
});

export const RunIngestSchema = z.object({
  agentId: z.string().min(1),
  runId: z.string().min(1),
  sessionId: z.string().optional(),
  caller: z.string().min(1),
  environment: z.enum(['production', 'staging', 'development']),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  spans: z.array(SpanSchema).min(1),
  outputPreview: z.string().max(8000).optional().default(''),
  outputLengthChars: z.number().min(0).optional().default(0),
});

export const RegressionEvaluationSchema = z.object({
  agentId: z.string().min(1),
  runId: z.string().min(1),
  baselineSampleSize: z.number().min(1).max(1000).optional().default(100),
});

export const CostAnomalyEvaluationSchema = z.object({
  agentId: z.string().min(1),
  runCostUsd: z.number().min(0),
  windowDays: z.number().min(1).max(90).optional().default(7),
});

export const SlaEvaluationSchema = z.object({
  agentId: z.string().min(1),
  windowHours: z.number().min(1).max(720).optional().default(24),
});

export type Span = z.infer<typeof SpanSchema>;
export type RunIngestPayload = z.infer<typeof RunIngestSchema>;
export type RegressionEvaluationPayload = z.infer<typeof RegressionEvaluationSchema>;
export type CostAnomalyEvaluationPayload = z.infer<typeof CostAnomalyEvaluationSchema>;
export type SlaEvaluationPayload = z.infer<typeof SlaEvaluationSchema>;
