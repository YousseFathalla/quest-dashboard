import { DashboardState, LogEvent } from '@models/dashboard.types';

export function calculateStateFromEvent(
  state: DashboardState,
  newEvent: LogEvent
): Partial<DashboardState> {
  if (state.isPaused) return {};
  const updatedEvents = [newEvent, ...state.events].slice(0, 200);

  // Optimistic UI Update for Stats
  const updatedStats = { ...state.stats };
  updatedStats.totalWorkflowsToday++;
  if (newEvent.type === 'anomaly') {
    updatedStats.activeAnomalies++;
  }

  // Recalculate SLA dynamically based on the rolling window of 200 events
  const recentAnomalies = updatedEvents.filter((e) => e.type === 'anomaly').length;
  const recentNonAnomalies = updatedEvents.length - recentAnomalies;
  updatedStats.slaCompliance =
    updatedEvents.length === 0
      ? 100
      : Math.round((recentNonAnomalies / updatedEvents.length) * 100);

  // Recalculate Avg Cycle Time based on completed events in the window
  const completedEvents = updatedEvents.filter(
    (e) => e.type === 'completed' && e.cycleTime
  );
  updatedStats.cycleTime =
    completedEvents.length > 0
      ? Math.round(
          completedEvents.reduce((sum, e) => sum + (e.cycleTime || 0), 0) /
            completedEvents.length
        )
      : updatedStats.cycleTime;

  return {
    events: updatedEvents,
    stats: updatedStats,
  };
}
