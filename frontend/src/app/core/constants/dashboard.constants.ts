/**
 * @fileoverview Constants used throughout the dashboard application.
 * Includes configuration for event history, chart dimensions, and refresh rates.
 */

export const DASHBOARD_CONSTANTS = {
  /** The maximum number of events to retain in the store history. */
  MAX_EVENTS_HISTORY: 5000,
  /** The debounce time in milliseconds for updating charts to prevent performance issues. */
  CHART_UPDATE_DEBOUNCE_MS: 100,
} as const;
