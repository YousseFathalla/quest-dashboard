
# System Architecture

## Overview

- The Legal Workflow Monitoring Dashboard is a real-time analytics platform designed to provide visibility into legal operations,
- It uses a reactive architecture to process high-frequency event streams and visualize them instantly.

## 🧠 Data Ingestion Strategy & Challenge Compliance

The coding challenge specifications requested three separate API endpoints:

1. `GET /stats/overview`
2. `GET /stats/timeline`
3. `GET /stats/anomalies`

- I have implemented all three of these endpoints (`backend/src/routes/stats.js`) and ready-to-use service methods (`dashboard.service.ts`).

### 💡 Architectural Decision: The "Snapshot" Pattern

However, in the active application, I deliberately chose **not to use** these three separate endpoints in favor of a single atomic `GET /snapshot` endpoint.

- Why? In a real-time system, fetching related state via multiple asynchronous requests introduces **"Data Tearing"** (Race Conditions).

- Scenario: If `GET /overview` executes at `T=0` and `GET /timeline` executes at `T=1`, and a new event arrives at `T=0.5`.
- Result: The "Total Count" in Overview will not match the number of items in the Timeline list.
- Solution: The `/snapshot` endpoint locks the state and returns the Overview, Timeline, and Volume metrics in a single, atomic JSON payload, ensuring mathematical consistency across the entire dashboard.

The "Legacy" endpoints are fully functional to demonstrate strict compliance with the challenge requirements.

## 🌐 Live Deployment & Endpoints

- **Frontend**: [Live Demo](https://content-luck-production.up.railway.app/)
- **Core Endpoints**:
  - [Stream (SSE)](https://quest-dashboard-production-edef.up.railway.app/stream)
  - [Snapshot](https://quest-dashboard-production-edef.up.railway.app/snapshot)
- **Legacy Endpoints (Unused)**:
  - [/stats/overview](https://quest-dashboard-production-edef.up.railway.app/stats/overview)
  - [/stats/timeline](https://quest-dashboard-production-edef.up.railway.app/stats/timeline)
  - [/stats/anomalies](https://quest-dashboard-production-edef.up.railway.app/stats/anomalies)

## 🛠️ Technology Stack

### Frontend

- **Framework**: [Angular 21](https://angular.dev) (Standalone Components, Esbuild)
- **State Management**: [NgRx SignalStore](https://ngrx.io/guide/signals) (v20+) - Chosen for its granular reactivity and seamless integration with Angular Signals.
- **Visualization**: [Apache ECharts 6.0](https://echarts.apache.org/) - High-performance canvas rendering for 10k+ data points.
- **Styling**: [TailwindCSS 4.1](https://tailwindcss.com) + [Angular Material 21](https://material.angular.io).
- **Testing**: Vitest (Unit) + Fast-Check (Property-Based).

### Backend

- **Runtime**: Node.js (v20 LTS)
- **Framework**: Express.js
- **Real-Time**: Native Server-Sent Events (SSE) (No heavy WebSocket libraries required).
- **Simulation**: Custom probabilistic event generator with "Chaos" capabilities.

## 🛡️ Resilience, Stability & Chaos Engineering (Bonus)

To demonstrate robustness and simulate a distributed environment, we implemented a custom **Chaos Middleware** (`backend/src/app.js`).

- **Chaos Engineering**:
  - **Random Failures**: 5% of API snapshots fail with a 500 status to test retry logic.
  - **Connection Severing**: The SSE stream is periodically disconnected to verify auto-reconnection.
  - **Goal**: Proves the frontend's ability to gracefully handle errors without crashing.
- **Failover & Recovery**:
  - **Atomic Data Fetching**: Initial dashboard state (Overview, Timeline, Volume) is fetched in a single atomic payload to prevent partial hydration.
  - **Auto-Reconnection**: SSE connection automatically attempts to reconnect upon network interruption using exponential backoff.
  - **User Feedback**: Non-intrusive `SnackBar` notifications inform users of connection loss and restoration.

## ⚡ Performance Optimization

- **Deferrable Views (`@defer`)**:
  - Heavy visualization components (`Heatmap`, `VolumeChart`, `EventLog`) are explicitly marked for lazy loading.
  - **Trigger**: `on viewport` (loads when scrolled into view) and `prefetch on idle`.
  - **Impact**: Drastically reduces Initial Contentful Paint (ICP) and blocking time.
- **Change Detection**: **OnPush** strategy is enabled globally to minimize change detection cycles.
- **Build Optimization**: Uses **Esbuild** (via Angular 21 CLI) for sub-second builds and tree-shaking.
- **Canvas Rendering**: ECharts is configured to use the **Canvas renderer** (not SVG) to handle 10k+ data points at 60fps.

## 🔄 Data Flow

1. **Event Generation**: The Backend (`server.js`) generates synthetic events (SLA Breaches, Case Delays, etc.).
2. **Stream Consumption**: The Frontend `DashboardService` connects to the `/stream` endpoint via Server-Sent Events (SSE).
3. **State Update**: `DashboardStore` (SignalStore) subscribes to the stream.
   - **History Events**: Replaces the current event list (via atomic snapshot).
   - **Live Events**: Prepended to the event list (immutable update).
4. **Reactive Derivation**: Computed signals (`filteredEvents`, `criticalCount`) automatically update when the event list changes.
5. **Visualization Update**: Angular `effect()` blocks detect signal changes and update ECharts instances efficiently (using `merge` option).

## ♿ Accessibility (A11y)

- **Semantic HTML**: Extensive use of semantic tags (`<nav>`, `<main>`, `<article>`) and appropriate ARIA roles.
- **Keyboard Navigation**: All interactive elements (Charts, Tables, Dialogs) are focusable and navigable via keyboard.
- **Visual Clarity**: High contrast ratios and clear focus indicators.
- **Screen Reader Support**: Use of `aria-label`, `aria-live` regions for real-time updates, and correct list structures for event logs.

## 📂 Directory Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── core/           # Core Services, Interceptors & Constants
│   │   ├── features/       # Feature Components (Charts, Logs, Dialogs)
│   │   ├── layout/         # Layout Components (Header)
│   │   ├── models/         # TypeScript Interfaces
│   │   ├── shared/         # Reusable UI & Utilities
│   │   ├── store/          # Global State (SignalStore)
│   │   └── app.ts          # Root Component
backend/
├── src/
│   ├── data/               # Store Data
│   ├── routes/             # Express Routes (snapshot, stream)
│   ├── simulation/         # Event Generation Logic
│   ├── utils/              # Helper Utilities
│   ├── app.js              # Express App Setup & Chaos Middleware
│   └── server.js           # Server Entry Point
```

## 📈 Scalability & Architecture

- **Stateless Backend**: SSE connections are lightweight and unidirectional. Scaling horizontally requires a message broker (e.g., Redis Pub/Sub) to broadcast events to all instances.
- **Signal-Based Reactivity**: Angular Signals provide fine-grained updates, ensuring that only the specific DOM elements tied to changed data are re-rendered, rather than checking the entire component tree.
- **Modular Design**: Feature-based directory structure allows for easy splitting of domains as the application grows.

---

Built By `Youssef Fathalla`
