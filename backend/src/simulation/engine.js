// src/simulation/engine.js
import { store } from "../data/store.js";
import streamManager from "../utils/stream-manager.js";
import { updateMetrics, randomSeverity, randomType } from "./generator.js";

function randomInterval() {
  return (10 + Math.floor(Math.random() * 11)) * 1000;
}

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

export function startSimulation() {
  console.log("🚀 Simulation Engine Started...");

  const runLoop = () => {
    const delay = randomInterval();

    setTimeout(() => {
      const event = generateEvent();

      store.events.push(event);
      if (event.type === "anomaly") {
        store.anomalies.push(event);
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
