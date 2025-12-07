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

  // Calculate the number of events to match the approximate live generation rate
  // Live: ~1 event every 15s = 4/min = 240/hour
  // 24 hours * 240 events = 5760 events. 
  // We'll use 500 as requested.
  const INITIAL_COUNT = 200; 

  for (let i = 0; i < INITIAL_COUNT; i++) {
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

  // SORTING IS CRITICAL:
  // Since we generated random timestamps in the loop, the array is NOT Chronological.
  // This causes issues when we slice(-200) later (we get random events, not the latest).
  store.events.sort((a, b) => a.timestamp - b.timestamp);
  store.anomalies.sort((a, b) => a.timestamp - b.timestamp);

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
