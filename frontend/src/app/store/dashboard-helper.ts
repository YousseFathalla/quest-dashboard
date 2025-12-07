/**
 * @fileoverview Helper functions for updating the Dashboard state.
 * Contains pure functions to calculate pure state based on incoming events.
 */

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

  // Limit to 5000 to cover ~24h of history (approx 240 events/hour * 24h = 5760 max)
  const updatedEvents = [newEvent, ...state.events].slice(0, 5000);

  // Optimistic UI Update for Stats
  const updatedStats = { ...state.stats };
  updatedStats.totalWorkflowsToday++;
  if (newEvent.type === 'anomaly') {
    updatedStats.activeAnomalies++;
  }

  // Recalculate SLA dynamically based on the rolling window
  // Use slice(0, 5000) to match the stored events limit
  const recentWindow = updatedEvents.slice(0, 5000);
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
