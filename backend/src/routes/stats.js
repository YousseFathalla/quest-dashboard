/**
 * @fileoverview Express router for retrieving statistical data.
 * Provides endpoints for overview, timeline, anomalies, and volume data.
 */

import { Router } from "express";
import { store } from "../data/store.js";

export const router = Router();

/**
 * GET /stats/snapshot
 * Retrieves all dashboard data (overview, timeline, volume) in a single atomic request.
 * This prevents partial loading states where one widget loads and another fails.
 *
 * @name GET/stats/snapshot
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

/**
 * GET /stats/overview
 * Retrieves the current overview statistics.
 *
 * @name GET/stats/overview
 * @function
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 */
router.get("/overview", (req, res) => {
  res.json(store.overview);
});

/**
 * GET /stats/timeline
 * Retrieves a timeline of the last 200 events.
 * Timestamps are dynamically adjusted to be relative to the current time,
 * ensuring they appear within the last 24 hours.
 *
 * @name GET/stats/timeline
 * @function
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 */
router.get("/timeline", (req, res) => {
  // Return events from the last 24 hours.
  // We DO NOT shift timestamps anymore because it creates artifacts when mixed with live data.
  // We DO NOT limit to 200 items because it creates sparsity issues (dots vs dense live lines).
  
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  // Filter for last 24h
  // Since store is sorted (thanks to generator fix), we could optimize this, but filter is fine.
  const events = store.events.filter(e => e.timestamp >= twentyFourHoursAgo);
  
  res.json(events);
});

/**
 * GET /stats/anomalies
 * Retrieves the last 200 anomaly events.
 *
 * @name GET/stats/anomalies
 * @function
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 */
router.get("/anomalies", (req, res) => {
  res.json(store.anomalies.slice(-200));
});

/**
 * GET /stats/volume
 * Retrieves the volume of events per hour over the last 24 hours.
 *
 * @name GET/stats/volume
 * @function
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 */
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
