/**
 * @fileoverview Utility functions for computing metrics and statistics from the data store.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Computes overview statistics such as SLA compliance, cycle time, and anomaly counts.
 *
 * @param {Object} store - The data store containing events and anomalies.
 * @returns {Object} An object containing calculated metrics:
 *  - slaCompliance {number}: Percentage of non-anomaly events in the last 200 events.
 *  - cycleTime {number}: Average cycle time for completed events.
 *  - activeAnomalies {number}: Total count of anomalies.
 *  - totalWorkflowsToday {number}: Total number of events in the store.
 */
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

/**
 * Computes the volume of events per hour for the last N hours.
 *
 * @param {Object} store - The data store.
 * @param {number} [hours=24] - The number of past hours to analyze.
 * @returns {Array<Object>} An array of objects representing each hour, containing counts for 'completed', 'pending', and 'anomaly'.
 */
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

/**
 * Computes data for the heatmap visualization.
 * Aggregates anomalies by hour of day and severity level.
 *
 * @param {Object} store - The data store.
 * @returns {Array<Object>} An array of cells, each with 'hour', 'severity', and 'count'.
 */
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
