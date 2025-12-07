export const DASHBOARD_CONSTANTS = {
  // how many events we keep in memory before we start dropping the old ones
  MAX_EVENTS_HISTORY: 6000,
  // throttle updates to keep the UI buttery smooth
  CHART_UPDATE_DEBOUNCE_MS: 100,
} as const;
