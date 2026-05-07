import type { Span } from '../schemas/validation-schemas.js';

export interface AgentRun {
  id: string;
  agentId: string;
  sessionId?: string;
  caller: string;
  environment: 'production' | 'staging' | 'development';
  startedAt: string;
  endedAt: string;
  totalLatencyMs: number;
  totalCostUsd: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  toolCallCount: number;
  retryCount: number;
  status: 'ok' | 'error' | 'timeout';
  outputLengthChars: number;
  outputPreview: string;
  spans: Span[];
  // Evaluation
  decision: 'allowed' | 'flagged' | 'blocked';
  postureScore: number;
  findings: string[];
}

export const runs: AgentRun[] = [
  {
    id: 'run_8a91fe',
    agentId: 'agt_data_analyst',
    sessionId: 'sess_dash_q2',
    caller: 'analytics_team_user_42',
    environment: 'production',
    startedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 12 + 28400).toISOString(),
    totalLatencyMs: 28400,
    totalCostUsd: 1.42,
    totalInputTokens: 142000,
    totalOutputTokens: 8400,
    toolCallCount: 11,
    retryCount: 3,
    status: 'ok',
    outputLengthChars: 3120,
    outputPreview: 'Q2 revenue by region with 7-day rolling average...',
    spans: [
      { spanId: 'sp_01', kind: 'router', name: 'route_intent', model: 'claude-sonnet-4-6', inputTokens: 480, outputTokens: 32, costUsd: 0.0024, latencyMs: 410, status: 'ok' },
      { spanId: 'sp_02', parentSpanId: 'sp_01', kind: 'llm', name: 'plan_query', model: 'claude-opus-4-7', inputTokens: 2200, outputTokens: 480, costUsd: 0.0594, latencyMs: 1820, status: 'ok' },
      { spanId: 'sp_03', parentSpanId: 'sp_02', kind: 'tool', name: 'snowflake.describe', inputTokens: 0, outputTokens: 0, costUsd: 0, latencyMs: 720, status: 'ok' },
      { spanId: 'sp_04', parentSpanId: 'sp_02', kind: 'tool', name: 'snowflake.query', inputTokens: 0, outputTokens: 0, costUsd: 0, latencyMs: 4200, status: 'error', errorMessage: 'syntax error near "ROLLING_AVG"' },
      { spanId: 'sp_05', parentSpanId: 'sp_02', kind: 'llm', name: 'fix_query (retry 1)', model: 'claude-opus-4-7', inputTokens: 4100, outputTokens: 920, costUsd: 0.1230, latencyMs: 3120, status: 'ok' },
      { spanId: 'sp_06', parentSpanId: 'sp_05', kind: 'tool', name: 'snowflake.query', inputTokens: 0, outputTokens: 0, costUsd: 0, latencyMs: 5800, status: 'error', errorMessage: 'timeout exceeded' },
      { spanId: 'sp_07', parentSpanId: 'sp_05', kind: 'llm', name: 'fix_query (retry 2)', model: 'claude-opus-4-7', inputTokens: 8200, outputTokens: 1240, costUsd: 0.2046, latencyMs: 4400, status: 'ok' },
      { spanId: 'sp_08', parentSpanId: 'sp_07', kind: 'tool', name: 'snowflake.query', inputTokens: 0, outputTokens: 0, costUsd: 0, latencyMs: 4200, status: 'ok' },
      { spanId: 'sp_09', parentSpanId: 'sp_07', kind: 'llm', name: 'summarize_results', model: 'claude-opus-4-7', inputTokens: 124000, outputTokens: 5800, costUsd: 1.0298, latencyMs: 2840, status: 'ok' },
      { spanId: 'sp_10', parentSpanId: 'sp_09', kind: 'tool', name: 'plotly.render', inputTokens: 0, outputTokens: 0, costUsd: 0, latencyMs: 480, status: 'ok' },
      { spanId: 'sp_11', parentSpanId: 'sp_09', kind: 'guardrail', name: 'pii_check', model: 'claude-sonnet-4-6', inputTokens: 3020, outputTokens: 60, costUsd: 0.0094, latencyMs: 410, status: 'ok' },
    ],
    decision: 'flagged',
    postureScore: 51,
    findings: [
      'Cost 4.2x baseline P95 for this agent.',
      'Latency 28.4s exceeds SLA (15s) by 89%.',
      '3 retries on snowflake.query — suggests prompt regression on schema changes.',
      'Tool loop heuristic triggered: snowflake.query invoked 3 times.',
    ],
  },
  {
    id: 'run_b40ace',
    agentId: 'agt_support_triage',
    sessionId: 'sess_zd_4221',
    caller: 'zendesk_webhook',
    environment: 'production',
    startedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 2 + 2810).toISOString(),
    totalLatencyMs: 2810,
    totalCostUsd: 0.0042,
    totalInputTokens: 1820,
    totalOutputTokens: 240,
    toolCallCount: 2,
    retryCount: 0,
    status: 'ok',
    outputLengthChars: 280,
    outputPreview: 'Routed to billing-tier-2 with priority HIGH.',
    spans: [],
    decision: 'allowed',
    postureScore: 96,
    findings: [],
  },
  {
    id: 'run_c2d1fa',
    agentId: 'agt_code_review',
    caller: 'github_webhook_pr_4421',
    environment: 'production',
    startedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 8 + 14200).toISOString(),
    totalLatencyMs: 14200,
    totalCostUsd: 0.34,
    totalInputTokens: 32000,
    totalOutputTokens: 2400,
    toolCallCount: 6,
    retryCount: 1,
    status: 'ok',
    outputLengthChars: 1840,
    outputPreview: '4 review comments posted; flagged 1 risky change to auth middleware.',
    spans: [],
    decision: 'flagged',
    postureScore: 68,
    findings: [
      'Cost 1.6x baseline; PR was 8 files larger than typical.',
      'Latency 14.2s exceeds SLA (10s) by 42%.',
    ],
  },
  {
    id: 'run_e9b822',
    agentId: 'agt_sales_outreach',
    caller: 'hubspot_workflow_91',
    environment: 'production',
    startedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 4 + 5100).toISOString(),
    totalLatencyMs: 5100,
    totalCostUsd: 0.067,
    totalInputTokens: 8400,
    totalOutputTokens: 920,
    toolCallCount: 3,
    retryCount: 0,
    status: 'ok',
    outputLengthChars: 1140,
    outputPreview: 'Drafted personalized outreach for prospect at Acme Corp.',
    spans: [],
    decision: 'allowed',
    postureScore: 89,
    findings: [],
  },
  {
    id: 'run_f12d44',
    agentId: 'agt_invoice_processor',
    caller: 's3_event_invoice_2026q2_18420',
    environment: 'production',
    startedAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 1 + 4080).toISOString(),
    totalLatencyMs: 4080,
    totalCostUsd: 0.0058,
    totalInputTokens: 3200,
    totalOutputTokens: 480,
    toolCallCount: 3,
    retryCount: 0,
    status: 'ok',
    outputLengthChars: 620,
    outputPreview: 'Posted invoice INV-2026-04-1842 to NetSuite for $14,820.00.',
    spans: [],
    decision: 'allowed',
    postureScore: 94,
    findings: [],
  },
  {
    id: 'run_g78c10',
    agentId: 'agt_research',
    caller: 'strategy_user_18',
    environment: 'production',
    startedAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 22 + 21800).toISOString(),
    totalLatencyMs: 21800,
    totalCostUsd: 0.51,
    totalInputTokens: 88000,
    totalOutputTokens: 6200,
    toolCallCount: 14,
    retryCount: 1,
    status: 'ok',
    outputLengthChars: 4280,
    outputPreview: 'Brief on enterprise AI governance market sized at $4.2B by 2027...',
    spans: [],
    decision: 'allowed',
    postureScore: 88,
    findings: [],
  },
];

export interface AgentBaseline {
  agentId: string;
  windowDays: number;
  sampleSize: number;
  costP50Usd: number;
  costP95Usd: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  toolCallP50: number;
  outputLengthMeanChars: number;
  outputLengthStdDev: number;
  computedAt: string;
}

export const baselines: AgentBaseline[] = [
  {
    agentId: 'agt_data_analyst',
    windowDays: 7,
    sampleSize: 612,
    costP50Usd: 0.18,
    costP95Usd: 0.34,
    latencyP50Ms: 9800,
    latencyP95Ms: 15200,
    toolCallP50: 4,
    outputLengthMeanChars: 1840,
    outputLengthStdDev: 480,
    computedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    agentId: 'agt_support_triage',
    windowDays: 7,
    sampleSize: 28840,
    costP50Usd: 0.0038,
    costP95Usd: 0.0061,
    latencyP50Ms: 1820,
    latencyP95Ms: 2940,
    toolCallP50: 2,
    outputLengthMeanChars: 240,
    outputLengthStdDev: 60,
    computedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    agentId: 'agt_code_review',
    windowDays: 7,
    sampleSize: 1284,
    costP50Usd: 0.18,
    costP95Usd: 0.21,
    latencyP50Ms: 8400,
    latencyP95Ms: 9800,
    toolCallP50: 5,
    outputLengthMeanChars: 1620,
    outputLengthStdDev: 280,
    computedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

export interface Incident {
  id: string;
  agentId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  detector: string;
  status: 'open' | 'investigating' | 'mitigated' | 'closed';
  openedAt: string;
}

export const incidents: Incident[] = [
  {
    id: 'inc_aob_001',
    agentId: 'agt_data_analyst',
    severity: 'critical',
    title: 'Cost budget exceeded — agent at 321% of monthly budget',
    detector: 'cost-budget',
    status: 'investigating',
    openedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'inc_aob_002',
    agentId: 'agt_data_analyst',
    severity: 'high',
    title: 'Latency regression — P95 4.2x baseline (28.4s vs 6.7s)',
    detector: 'latency-regression',
    status: 'open',
    openedAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: 'inc_aob_003',
    agentId: 'agt_code_review',
    severity: 'medium',
    title: 'SLA breach — success rate 91.8% below SLA threshold 95%',
    detector: 'sla-evaluator',
    status: 'open',
    openedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'inc_aob_004',
    agentId: 'agt_oncall_summary',
    severity: 'medium',
    title: 'SLA breach — P95 latency 9.1s exceeds 8s threshold',
    detector: 'sla-evaluator',
    status: 'open',
    openedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];
