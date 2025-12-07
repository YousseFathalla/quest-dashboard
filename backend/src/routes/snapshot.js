/**
 * @fileoverview Express router for retrieving statistical data.
 * Provides endpoints for overview, timeline, anomalies, and volume data.
 */

import { Router } from "express";
import { store } from "../data/store.js";

export const router = Router();

/**
 * GET /snapshot
 * Retrieves all dashboard data (overview, timeline, volume) in a single atomic request.
 * This prevents partial loading states where one widget loads and another fails.
 *
 * @name GET/snapshot
 * @function
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 */
router.get("/snapshot", (req, res) => {
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  // 1. Overview
  const overview = store.overview;

  // 2. Timeline (Last 24h)
  const events = store.events.filter(e => e.timestamp >= twentyFourHoursAgo);

  // 3. Volume
  const hours = new Array(24).fill().map((_, i) => ({
    hour: i,
    completed: 0,
    pending: 0,
    anomaly: 0,
  }));
  store.events.forEach((e) => {
    const h = new Date(e.timestamp).getHours();
    hours[h][e.type]++;
  });

  res.json({
    overview,
    events,
    volume: hours
  });
});



export default router;
