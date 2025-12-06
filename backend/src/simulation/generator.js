// src/simulation/generator.js
import { store } from "../data/store.js";
import { computeOverview } from "./metrics.js";

// ✅ NEW: Export this helper so engine.js can use it
export function updateMetrics() {
  store.overview = computeOverview(store);
}

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

export function randomType() {
  const r = Math.random();
  if (r < 0.6) return "completed"; // 60%
  if (r < 0.8) return "pending"; // 20%
  return "anomaly"; // 20%
}

export function randomSeverity() {
  return Math.ceil(Math.random() * 5);
}
