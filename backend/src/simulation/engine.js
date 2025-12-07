/**
 * @fileoverview Core simulation engine for generating workflow events.
 * Handles event generation loops, updating global state, and broadcasting to SSE clients.
 */

import { store } from "../data/store.js";
import streamManager from "../utils/stream-manager.js";
import { updateMetrics, randomSeverity, randomType } from "./generator.js";

/**
 * Generates a random interval between 10 and 20 seconds.
 *
 * @returns {number} Time in milliseconds.
 */
function randomInterval() {
  return (10 + Math.floor(Math.random() * 11)) * 1000;
}

/**
 * Generates a new workflow event with random properties.
 *
 * @returns {Object} The generated event object.
 * @property {string} id - Unique identifier for the event.
 * @property {number} timestamp - The time the event occurred (ms since epoch).
 * @property {string} type - The type of event ('completed', 'pending', or 'anomaly').
 * @property {number|undefined} severity - Severity level (1-5) if type is 'anomaly'.
 * @property {number|undefined} cycleTime - Cycle time in minutes if type is 'completed'.
 */
function generateEvent() {
  const type = randomType();
  return {
    id: "ev_" + Date.now(),
    timestamp: Date.now(),
    type,
    severity: type === "anomaly" ? randomSeverity() : undefined,
    cycleTime: type === "completed" ? Math.floor(Math.random() * 120) + 10 : undefined, // 10-130 mins
  };
}

/**
 * Starts the simulation loop.
 * Recursively schedules event generation, updates metrics, and broadcasts events.
 *
 * @returns {void}
 */
export function startSimulation() {
  console.log("Simulation Engine Started...");

  /**
   * recursive loop function.
   */
  const runLoop = () => {
    const delay = randomInterval();

    setTimeout(() => {
      const event = generateEvent();

      store.events.push(event);
      if (event.type === "anomaly") {
        store.anomalies.push(event);
      }

      // 1.5 Limit Store Size (Prevent Memory Leak)
      const MAX_EVENTS = 5000;
      if (store.events.length > MAX_EVENTS) {
        // Remove oldest events
        store.events = store.events.slice(-MAX_EVENTS);
        // Also cleanup anomalies if needed, though they are fewer
        if (store.anomalies.length > MAX_EVENTS) {
          store.anomalies = store.anomalies.slice(-MAX_EVENTS);
        }
      }

      // 2. Recalculate Stats
      updateMetrics();

      // 3. Broadcast via Singleton (No more globalThis!)
      streamManager.broadcast(event);

      runLoop();
    }, delay);
  };
  runLoop();
}
