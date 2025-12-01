// backend/server.js

// 1. Import the libraries we just installed
const express = require("express");
const http = require("node:http");
const WebSocket = require("ws");
const cors = require("cors");

// 2. Setup the "Express" app (The standard API)
const app = express();
app.use(cors()); // Allow all connections (Great for development)

// 3. Create a basic API Endpoint (Just to test if it works)
// If you visit http://localhost:3000/stats/overview, you get this JSON
app.get("/stats/overview", (req, res) => {
  res.json({
    totalWorkflows: Math.floor(Math.random() * 100),
    averageCycleTime: "4h 30m",
    slaCompliance: 92,
    activeAnomalies: 3,
  });
});

// 4. Setup the HTTP Server
const server = http.createServer(app);

// 5. Setup the WebSocket "Radio Station" (Real-time layer)
const wss = new WebSocket.Server({ server });

// Helper function: Generates a fake "Event"
function generateRandomEvent() {
  const types = ["SLA_BREACH", "CASE_DELAY", "WORKFLOW_COMPLETE", "NEW_CASE"];
  const severities = ["CRITICAL", "WARNING", "INFO"];

  return {
    id: Date.now(),
    type: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    timestamp: new Date().toISOString(),
    message: `Event detected at ${new Date().toLocaleTimeString()}`,
  };
}

// 6. Define what happens when a User connects
wss.on("connection", (ws) => {
  console.log("🔌 Client connected to Real-Time Stream");

  // Send a new event every 3 seconds
  const interval = setInterval(() => {
    const event = generateRandomEvent();
    console.log("Broadcasting:", event.type);
    ws.send(JSON.stringify(event));
  }, 3000);

  // When they disconnect, stop the timer so we don't crash
  ws.on("close", () => {
    console.log("❌ Client disconnected");
    clearInterval(interval);
  });
});

// 7. Start listening on Port 3000
server.listen(3000, () => {
  console.log("🚀 Backend running on http://localhost:3000");
});
