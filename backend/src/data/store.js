/**
 * @fileoverview In-memory data store for the application.
 * Holds events, anomalies, and overview statistics.
 */

/**
 * @typedef {Object} OverviewStats
 * @property {number} slaCompliance - The percentage of SLA compliance.
 * @property {number} cycleTime - The average cycle time in milliseconds.
 * @property {number} activeAnomalies - The count of currently active anomalies.
 * @property {number} totalWorkflowsToday - The total number of workflows processed today.
 */

/**
 * @typedef {Object} Store
 * @property {Array<Object>} events - A list of workflow events.
 * @property {Array<Object>} anomalies - A list of detected anomalies.
 * @property {OverviewStats} overview - aggregated overview statistics.
 */

/**
 * The global in-memory store.
 * @type {Store}
 */
export const store = {
  events: [],
  anomalies: [],
  overview: {
    slaCompliance: 0,
    cycleTime: 0,
    activeAnomalies: 0,
    totalWorkflowsToday: 0,
  },
};
