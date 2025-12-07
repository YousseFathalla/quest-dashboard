import { DASHBOARD_CONSTANTS } from '@core/constants/dashboard.constants';
import { DashboardState, LogEvent } from '@models/dashboard.types';

/**
 * Calculates the new dashboard state based on an incoming log event.
 * Updates the event list (maintaining a fixed size), and recalculates overview statistics.
 *
 * @param {DashboardState} state - The current state of the dashboard.
 * @param {LogEvent} newEvent - The new event received from the stream.
 * @returns {Partial<DashboardState>} A partial state object with updated events and stats.
 */
export function calculateStateFromEvent(
  state: DashboardState,
  newEvent: LogEvent
): Partial<DashboardState> {
  if (state.isPaused) return {};

  // Limit events to prevent memory issues, using configured constant
  const updatedEvents = [newEvent, ...state.events].slice(0, DASHBOARD_CONSTANTS.MAX_EVENTS_HISTORY);

  // Optimistic UI Update for Stats
  const updatedStats = { ...state.stats };
  updatedStats.totalWorkflowsToday++;
  if (newEvent.type === 'anomaly') {
    updatedStats.activeAnomalies++;
  }

  // Recalculate SLA dynamically based on the rolling window
  const recentWindow = updatedEvents.slice(0, DASHBOARD_CONSTANTS.MAX_EVENTS_HISTORY);
  const recentAnomalies = recentWindow.filter((e) => e.type === 'anomaly').length;
  const recentNonAnomalies = recentWindow.length - recentAnomalies;
  updatedStats.slaCompliance =
    recentWindow.length === 0
      ? 100
      : Math.round((recentNonAnomalies / recentWindow.length) * 100);

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
