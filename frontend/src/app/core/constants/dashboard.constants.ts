/**
 * @fileoverview Constants used throughout the dashboard application.
 * Includes configuration for event history, chart dimensions, and refresh rates.
 */

export const DASHBOARD_CONSTANTS = {
  /** The number of recent events to display in the overview widget. */
  RECENT_EVENTS_COUNT: 6,
  /** The maximum number of events to retain in the store history. */
  MAX_EVENTS_HISTORY: 1000,
  /** The height of the timeline chart in pixels. */
  TIMELINE_HEIGHT: 350,
  /** The height of the heatmap chart in pixels. */
  HEATMAP_HEIGHT: 300,
  /** The minimum height of the volume chart in pixels. */
  VOLUME_CHART_MIN_HEIGHT: 300,
  /** The debounce time in milliseconds for updating charts to prevent performance issues. */
  CHART_UPDATE_DEBOUNCE_MS: 100,
  /** The available time ranges for filtering dashboard data. */
  TIME_RANGES: ['6h', '12h', '24h'] as const,
} as const;
