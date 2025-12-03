
// backend/server.js

// 1. Import the libraries
import express from "express";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import cors from "cors";

// 2. Setup the "Express" app
const app = express();
app.use(cors());

// Mock Data Store
let events = [];
let stats = {
  totalWorkflows: 0,
  averageCycleTime: "0h",
  slaCompliance: 100,
  activeAnomalies: 0,
};

// Legal workflow event types aligned with business context
const LEGAL_WORKFLOW_EVENTS = {
  // Case intake events
  caseIntake: [
    { type: 'CASE_INTAKE', severity: 'INFO', message: 'New case received' },
    { type: 'CASE_ASSIGNED', severity: 'INFO', message: 'Case assigned to legal team' },
    { type: 'CASE_INTAKE_DELAYED', severity: 'WARNING', message: 'Case intake delayed' },
    { type: 'CASE_INTAKE_BREACH', severity: 'CRITICAL', message: 'SLA breach: Case intake exceeded time limit' },
  ],
  // Approval workflow events
  approvals: [
    { type: 'APPROVAL_REQUESTED', severity: 'INFO', message: 'Approval requested' },
    { type: 'APPROVAL_GRANTED', severity: 'INFO', message: 'Approval granted' },
    { type: 'APPROVAL_DENIED', severity: 'WARNING', message: 'Approval denied' },
    { type: 'APPROVAL_DELAYED', severity: 'WARNING', message: 'Approval process delayed' },
    { type: 'APPROVAL_BREACH', severity: 'CRITICAL', message: 'SLA breach: Approval exceeded time limit' },
  ],
  // Document review events
  documentReview: [
    { type: 'DOCUMENT_REVIEW_STARTED', severity: 'INFO', message: 'Document review started' },
    { type: 'DOCUMENT_REVIEW_COMPLETED', severity: 'INFO', message: 'Document review completed' },
    { type: 'DOCUMENT_REVIEW_DELAYED', severity: 'WARNING', message: 'Document review delayed' },
    { type: 'DOCUMENT_REVIEW_BREACH', severity: 'CRITICAL', message: 'SLA breach: Document review exceeded time limit' },
  ],
  // Workflow completion events
  workflowComplete: [
    { type: 'WORKFLOW_COMPLETED', severity: 'INFO', message: 'Workflow completed successfully' },
    { type: 'CASE_CLOSED', severity: 'INFO', message: 'Case closed' },
    { type: 'WORKFLOW_FINALIZED', severity: 'INFO', message: 'Workflow finalized' },
  ],
};

// Helper: Generate Random Event
function generateRandomEvent() {
  // 30% chance of being an anomaly (CRITICAL severity)
  const isAnomaly = Math.random() < 0.3;
  
  // 50% chance of being completed (INFO with completion indicators)
  const isCompleted = !isAnomaly && Math.random() < 0.5;
  
  let eventTemplate;
  
  if (isAnomaly) {
    // Select from critical events (SLA breaches, critical delays)
    const criticalEvents = [
      ...LEGAL_WORKFLOW_EVENTS.caseIntake.filter(e => e.severity === 'CRITICAL'),
      ...LEGAL_WORKFLOW_EVENTS.approvals.filter(e => e.severity === 'CRITICAL'),
      ...LEGAL_WORKFLOW_EVENTS.documentReview.filter(e => e.severity === 'CRITICAL'),
    ];
    eventTemplate = criticalEvents[Math.floor(Math.random() * criticalEvents.length)];
  } else if (isCompleted) {
    // Select from completion events
    const allCompleted = LEGAL_WORKFLOW_EVENTS.workflowComplete;
    eventTemplate = allCompleted[Math.floor(Math.random() * allCompleted.length)];
  } else {
    // Select from pending events (WARNING or INFO without completion indicators)
    const pendingEvents = [
      ...LEGAL_WORKFLOW_EVENTS.caseIntake.filter(e => e.severity !== 'CRITICAL'),
      ...LEGAL_WORKFLOW_EVENTS.approvals.filter(e => e.severity !== 'CRITICAL'),
      ...LEGAL_WORKFLOW_EVENTS.documentReview.filter(e => e.severity !== 'CRITICAL'),
    ];
    eventTemplate = pendingEvents[Math.floor(Math.random() * pendingEvents.length)];
  }

  return {
    id: Date.now(),
    type: eventTemplate.type,
    severity: eventTemplate.severity,
    timestamp: new Date().toISOString(),
    message: `${eventTemplate.message} at ${new Date().toLocaleTimeString()}`,
  };
}

// Start with empty events - they will populate as WebSocket connects

// 3. API Endpoints

app.get("/stats/overview", (req, res) => {
  // Simulate 5% error rate
  if (Math.random() < 0.05) {
    return res.status(500).json({ error: "Simulated Backend Error" });
  }
  res.json(stats);
});

app.get("/stats/timeline", (req, res) => {
  res.json(events.slice(0, 50)); // Return last 50 events
});

app.get("/stats/anomalies", (req, res) => {
  const anomalies = events.filter(e => e.severity === 'CRITICAL' || e.severity === 'WARNING');
  res.json(anomalies);
});

// 4. Setup the HTTP Server
const server = createServer(app);

// 5. Setup WebSocket
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("🔌 Client connected to Real-Time Stream");

  // Send initial stats
  ws.send(JSON.stringify({ type: 'STATS', data: stats }));

  // Send initial history (last 100 events)
  ws.send(JSON.stringify({ type: 'HISTORY', data: events.slice(0, 100) }));

  // Event generation interval
  const eventInterval = setInterval(() => {
    // Simulate 5% error rate in stream
    if (Math.random() < 0.05) {
      return;
    }

    const event = generateRandomEvent();
    events.unshift(event); // Add to history
    if (events.length > 1000) events.pop(); // Keep memory clean

    // Update stats
    stats.totalWorkflows++;
    if (event.severity === 'CRITICAL') stats.activeAnomalies++;
    
    // Update SLA compliance (simulate 95-100% range)
    stats.slaCompliance = Math.max(95, Math.min(100, stats.slaCompliance + (Math.random() < 0.5 ? -0.1 : 0.1)));
    
    // Update average cycle time (simulate 1-5 hours)
    const hours = Math.floor(Math.random() * 5) + 1;
    stats.averageCycleTime = `${hours}h`;
    
    console.log("Broadcasting:", event.type);
    ws.send(JSON.stringify(event));
  }, Math.floor(Math.random() * 10001) + 10000); // Random interval between 10-20 seconds (10000-20000ms)

  // Periodic stats update (every 10 seconds)
  const statsInterval = setInterval(() => {
    ws.send(JSON.stringify({ type: 'STATS', data: { ...stats } }));
  }, 10000);

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(eventInterval);
    clearInterval(statsInterval);
  });
});

// 6. Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
