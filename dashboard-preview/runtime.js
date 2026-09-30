(async () => {
  const ui = window.evidenceUi;
  try {
    const [summary, agentList, incidentList] = await Promise.all([
      ui.fetchJson('/api/dashboard/summary'), ui.fetchJson('/api/agents'), ui.fetchJson('/api/incidents'),
    ]);
    ui.metric('Agents in fixture', summary.fleet.totalAgents, `${summary.fleet.healthy} healthy · ${summary.fleet.degraded} degraded`);
    ui.metric('Seeded runs / 24h', summary.traffic.runs24h.toLocaleString(), 'Fixture aggregate, not live ingestion');
    ui.metric('Worst agent p95', `${(summary.traffic.fleetP95LatencyMs / 1000).toFixed(1)}s`, 'Maximum of per-agent fixture values');
    ui.metric('Open fixture incidents', summary.incidents.open, `${summary.incidents.total} seeded records`);
    ui.table(['Agent', 'Environment', 'Status', 'P95', 'Posture'], agentList.agents.map((agent) => [
      agent.name, agent.environment, agent.status, `${(agent.p95LatencyMs / 1000).toFixed(1)}s`, agent.postureScore,
    ]));
    incidentList.incidents.forEach((incident) => ui.item(incident.title, `${incident.severity.toUpperCase()} · ${incident.agentId} · ${incident.status}`));
    ui.state('LOCAL FIXTURE API · 3 endpoints responded');
  } catch (error) {
    ui.state(`API unavailable: ${error.message}`, true);
  }
})();
