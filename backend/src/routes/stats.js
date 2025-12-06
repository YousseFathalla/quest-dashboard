import { Router } from "express";
import { store } from "../data/store.js";

export const router = Router();

router.get("/overview", (req, res) => {
  res.json(store.overview);
});
router.get("/timeline", (req, res) => {
  // Refresh timestamps to be relative to current time
  // This ensures the frontend always sees events within the last 24 hours
  const now = Date.now();
  const events = store.events.slice(-200).map((event, index) => {
    // Spread events across the last 24 hours based on their original relative position
    const originalTimestamp = event.timestamp;
    const oldestEventTime = Math.min(...store.events.map(e => e.timestamp));
    const newestEventTime = Math.max(...store.events.map(e => e.timestamp));
    const timeRange = newestEventTime - oldestEventTime || 1;
    
    // Calculate relative position (0 to 1) and map to last 24 hours
    const relativePosition = (originalTimestamp - oldestEventTime) / timeRange;
    const newTimestamp = now - (24 * 60 * 60 * 1000) + (relativePosition * 24 * 60 * 60 * 1000);
    
    return {
      ...event,
      timestamp: Math.floor(newTimestamp)
    };
  });
  res.json(events);
});
router.get("/anomalies", (req, res) => {
  res.json(store.anomalies.slice(-200));
});
router.get("/volume", (req, res) => {
  const hours = new Array(24)
    .fill()
    .map((_, i) => ({
      hour: i,
      completed: 0,
      pending: 0,
      anomaly: 0,
    }));

  store.events.forEach((e) => {
    const h = new Date(e.timestamp).getHours();
    hours[h][e.type]++;
  });

  res.json(hours);
});

export default router;
