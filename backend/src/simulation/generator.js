/**
 * @fileoverview Generators for initial data seeding and random value creation.
 */

import { store } from "../data/store.js";
import { computeOverview } from "./metrics.js";

/**
 * Updates the global store's overview metrics based on current data.
 * @returns {void}
 */
export function updateMetrics() {
  store.overview = computeOverview(store);
}

/**
 * Seeds the store with initial historical data.
 * Generates 200 events spread over the last 24 hours.
 *
 * @returns {void}
 */
export function seedInitialData() {
  const now = Date.now();

  for (let i = 0; i < 200; i++) {
    const ts = now - Math.random() * 24 * 60 * 60 * 1000;
    const type = randomType();

    const event = {
      id: `ev_${i}`,
      timestamp: ts,
      type,
      severity: type === "anomaly" ? randomSeverity() : undefined,
      cycleTime: type === "completed" ? Math.floor(Math.random() * 120) + 10 : undefined,
    };

    store.events.push(event);
    if (type === "anomaly") store.anomalies.push(event);
  }

  // Calculate initial metrics
  updateMetrics();
}

/**
 * Returns a random event type based on weighted probabilities.
 * - 60% 'completed'
 * - 20% 'pending'
 * - 20% 'anomaly'
 *
 * @returns {string} The event type.
 */
export function randomType() {
  const r = Math.random();
  if (r < 0.6) return "completed"; // 60%
  if (r < 0.8) return "pending"; // 20%
  return "anomaly"; // 20%
}

/**
 * Returns a random severity level between 1 and 5.
 *
 * @returns {number} The severity level.
 */
export function randomSeverity() {
  return Math.ceil(Math.random() * 5);
}
