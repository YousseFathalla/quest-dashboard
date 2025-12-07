# Legal Workflow Monitoring Dashboard 🚀

A real-time analytics dashboard for legal operations, designed to provide visibility into workflow health, SLA compliance, and anomalies using a modern, reactive architecture.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Live Demo](#live-demo)

## 🚀 Live Demo

- **Frontend Application**: [Live Demo](https://content-luck-production.up.railway.app/)
- **Backend API**:
  - [Stream Endpoint](https://quest-dashboard-production-edef.up.railway.app/stream)
  - [Snapshot Endpoint](https://quest-dashboard-production-edef.up.railway.app/snapshot)

### Available Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/stream` | `GET` (SSE) | Real-time event stream including updates for `completed`, `pending`, and `anomaly` events. |
| `/snapshot` | `GET` | Fetches the initial state of the dashboard, including historical events and overview statistics. |

## 🔭 Overview

This solution provides a comprehensive view of legal workflow operations. It simulates a high-frequency event stream from a backend service and visualizes this data in real-time on a responsive Angular frontend. The system is designed to detect anomalies, track SLA compliance, and provide historical analysis through interactive charts.

## ⚡ Features

- **Real-Time Event Stream**: Live Server-Sent Events (SSE) integration processing events with sub-second latency.
- **Reactive State Management**: Powered by **Angular Signals** and **NgRx SignalStore** for predictable, unidirectional data flow.
- **Chaos Engineering**: Simulated backend failures and stream disconnections to demonstrate resilience and error handling.
- **Data Intelligence**:
  - **Timeline Visualization**: Interactive scatter plot of event history with visual jitter to handle high-density data.
  - **Anomaly Heatmap**: Aggregates critical errors by hour and severity to identify systemic issues.
  - **Hybrid Volume Chart**: Dual-axis visualization comparing total workflow volume vs. critical errors.
- **State-Driven Filtering**: Global time-range filters (6h/12h/24h) and event type filters managed via SignalStore.
- **Dark/Light Mode**: Fully themable UI with multiple color palettes.
- **Dockerized Deployment**: Full-stack containerization with Nginx and Node.js.

## 🛠️ Tech Stack

### Frontend

- **Framework**: Angular 21 (Standalone Components)
- **State Management**: @ngrx/signals (SignalStore)
- **Visualization**: Apache ECharts (via ngx-echarts)
- **Styling**: TailwindCSS, Angular Material
- **Testing**: Fast-Check (Property-based testing)

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-Time**: Server-Sent Events (SSE)
- **Simulation**: Custom simulation engine for generating synthetic workflow data

### DevOps

- **Containerization**: Docker, Docker Compose
- **Server**: Nginx (Multi-stage builds)

## 🏗️ Architecture

### Data Flow

1. **Simulation Engine**: The backend generates synthetic events (`completed`, `pending`, `anomaly`) at random intervals.
2. **Event Broadcasting**: Events are pushed to connected clients via Server-Sent Events (SSE).
3. **State Management**: The frontend `DashboardStore` maintains the application state. It connects to the SSE stream and updates the `events` list and `stats` metrics in real-time.
4. **Reactive UI**: Components subscribe to the store's signals. `Computed` signals automatically derive filtered views and aggregated metrics, ensuring efficient UI updates.

### Signal-First Design

- **Immutability**: State updates are atomic.
- **Performance**: `OnPush` change detection and granular signal dependencies minimize rendering cycles.
- **Derived State**: Metrics like `slaCompliance` and `activeAnomalies` are automatically recalculated when the underlying data changes.

## 📂 Project Structure

```text
quest-dashboard/
├── backend/                # Node.js API & Simulation Engine
│   ├── src/
│   │   ├── simulation/     # Data generation logic
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Stream management
├── frontend/               # Angular Application
│   ├── src/app/
│   │   ├── core/           # Services, Interceptors
│   │   ├── features/       # Business Logic Components
│   │   ├── layout/         # App Shell (Header)
│   │   ├── models/         # TypeScript Interfaces
│   │   ├── shared/         # Reusable Utilities & Components
│   │   └── store/          # NgRx SignalStore
└── docker-compose.yml      # Orchestration
```

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v18+)
- NPM
- Docker (optional)

### Local Development

1. **Backend Setup**:

   ```bash
   cd backend
   npm install
   npm start
   ```

   The backend will start on `http://localhost:3000`.

2. **Frontend Setup**:

   ```bash
   cd frontend
   npm install
   npm start
   ```

   The frontend will be available at `http://localhost:4200`.

### Docker Deployment

Run the entire stack with a single command:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Access the dashboard at **<http://localhost>**.

## 📖 Documentation

The codebase is fully documented using JSDoc (Backend) and TSDoc (Frontend).

- **Backend**: Check source files in `backend/src` for detailed API and function documentation.
- **Frontend**: Components and services in `frontend/src/app` include comprehensive usage details.

### Key Concepts

- **Chaos Monkey**: The backend includes a "Chaos Middleware" that randomly injects errors (5% rate) and disconnects streams to test frontend resilience.
- **Property-Based Testing**: The frontend uses `fast-check` to generate arbitrary data for robust testing of utility functions.

## 🛡️ License

This project is part of the Expanders360 Hiring Quest.
