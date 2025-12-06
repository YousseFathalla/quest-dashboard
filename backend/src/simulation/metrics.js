const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function computeOverview(store) {
  const events = store.events || [];
  const anomalies = store.anomalies || [];
  // Dynamic SLA: Use last 50 events so it fluctuates visibly
  const recentEvents = events.slice(-200);
  const recentAnomalies = recentEvents.filter((e) => e.type === "anomaly").length;
  const recentNonAnomalies = recentEvents.length - recentAnomalies;

  // Raw compliance (~85% based on generator)
  const slaCompliance = recentEvents.length === 0 ? 100 : Math.round((recentNonAnomalies / recentEvents.length) * 100);

  // Boost by 10% to hit the 90-100% "healthy" range user wants, but keep the fluctuation
  // const slaCompliance = Math.min(100, Math.round(rawSla + 10));

  // Calculate cycle time
  const completedEvents = events.filter((e) => e.type === "completed" && e.cycleTime);
  const cycleTime =
    completedEvents.length > 0
      ? Math.round(completedEvents.reduce((sum, e) => sum + e.cycleTime, 0) / completedEvents.length)
      : 0;

  // FIX: Count all events in the store as "Total Workflows" (since store is 24h window)
  const totalWorkflowsToday = events.length;

  // FIX: Widen "Active" window to 15 minutes so we see more anomalies
  // FIX: Count all anomalies (Total Anomalies) to match the list and frontend logic
  const activeAnomalies = anomalies.length;

  return {
    slaCompliance,
    cycleTime,
    activeAnomalies,
    totalWorkflowsToday,
  };
}

export function computeVolumePerHour(store, hours = 24) {
  const buckets = [];
  const now = new Date();
  for (let i = hours - 1; i >= 0; i--) {
    const dt = new Date(now.getTime() - i * 60 * 60 * 1000);
    buckets.push({
      hour: dt.getHours(),
      timestampStart: new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours()).getTime(),
      completed: 0,
      pending: 0,
      anomaly: 0,
    });
  }

  (store.events || []).forEach((e) => {
    for (let b of buckets) {
      if (e.timestamp >= b.timestampStart && e.timestamp < b.timestampStart + 60 * 60 * 1000) {
        if (e.type === "completed") b.completed++;
        else if (e.type === "pending") b.pending++;
        else if (e.type === "anomaly") b.anomaly++;
        break;
      }
    }
  });

  return buckets.map((b) => ({
    hour: b.hour,
    completed: b.completed,
    pending: b.pending,
    anomaly: b.anomaly,
  }));
}

export function computeHeatmapCells(store) {
  const counts = {};
  (store.anomalies || []).forEach((a) => {
    const hour = new Date(a.timestamp).getHours();
    const sev = a.severity || 1;
    const key = `${hour}_${sev}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  const cells = Object.keys(counts).map((k) => {
    const [hour, severity] = k.split("_").map(Number);
    return { hour, severity, count: counts[k] };
  });

  return cells;
}


