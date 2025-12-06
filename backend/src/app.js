/**
 * @fileoverview Main Express application entry point.
 * Configures middleware, routes, and initializes the simulation engine.
 */

import express from "express";
import cors from "cors";
import statsRoutes from "./routes/stats.js";
import streamRoute from "./routes/stream.js";
import { seedInitialData } from "./simulation/generator.js";
import { startSimulation } from "./simulation/engine.js";

const app = express();
app.use(cors());

/**
 * Middleware to simulate random backend failures (Chaos Engineering).
 * Introduces a 5% chance of returning a 500 error for /stats requests.
 *
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * @param {import("express").NextFunction} next - The next middleware function.
 * @returns {void|import("express").Response} Returns a 500 response if chaos strikes, otherwise calls next().
 */
const chaosMiddleware = (req, res, next) => {
  if (req.url.startsWith("/stats") && Math.random() < 0.05) {
    console.log(`💥 Chaos Monkey struck: ${req.url}`);
    return res.status(500).json({ error: "Simulated Backend Failure (Bonus Feature)" });
  }
  next();
};

app.use(chaosMiddleware);

// Initialize data and simulation
seedInitialData();
startSimulation();

// Register routes
app.use("/stats", statsRoutes);
app.use("/stream", streamRoute);

/**
 * Global error handling middleware.
 * Logs the error and returns a 500 status code.
 *
 * @param {Error} err - The error object.
 * @param {import("express").Request} req - The Express request object.
 * @param {import("express").Response} res - The Express response object.
 * @param {import("express").NextFunction} next - The next middleware function.
 */
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
