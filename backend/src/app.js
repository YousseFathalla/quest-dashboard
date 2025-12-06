// backend/src/app.js
import express from "express";
import cors from "cors";
import statsRoutes from "./routes/stats.js";
import streamRoute from "./routes/stream.js";
import { seedInitialData } from "./simulation/generator.js";
import { startSimulation } from "./simulation/engine.js";

const app = express();
app.use(cors());

// BONUS: Simulated backend errors (5% error rate)
const chaosMiddleware = (req, res, next) => {
  if (req.url.startsWith("/stats") && Math.random() < 0.05) {
    console.log(`💥 Chaos Monkey struck: ${req.url}`);
    return res.status(500).json({ error: "Simulated Backend Failure (Bonus Feature)" });
  }
  next();
};

app.use(chaosMiddleware);

seedInitialData();
startSimulation();

app.use("/stats", statsRoutes);
app.use("/stream", streamRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
