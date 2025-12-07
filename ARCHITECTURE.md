# System Architecture

## Overview

The Legal Workflow Monitoring Dashboard is a real-time analytics platform designed to provide visibility into legal operations. It uses a reactive architecture to process high-frequency event streams and visualize them instantly.

## 🌐 Live Deployment

The system is currently deployed and accessible at:

- **Frontend**: [https://content-luck-production.up.railway.app/](https://content-luck-production.up.railway.app/)
- **Backend**:
  - [https://quest-dashboard-production-edef.up.railway.app/stream](https://quest-dashboard-production-edef.up.railway.app/stream),
  - [https://quest-dashboard-production-edef.up.railway.app/snapshot](https://quest-dashboard-production-edef.up.railway.app/snapshot)

## Technology Stack

### Frontend

- **Framework**: Angular 21 (Standalone Components)
- **State Management**: NgRx SignalStore (Reactive, localized state)
- **Visualization**: Apache ECharts (High-performance canvas rendering)
- **Styling**: TailwindCSS (Utility-first) + Angular Material (Accessible components)
- **Build Tool**: Angular CLI (Esbuild)

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-Time**: Server-Sent Events (SSE)
- **Containerization**: Docker (Multi-stage builds)

## Resilience & Stability

- **Chaos Engineering**: Middleware (`chaosMiddleware`) simulates random backend failures (5% error rate on API calls) to ensure frontend resilience.
- **Failover & Recovery**:
  - **Atomic Data Fetching**: Initial dashboard state (Overview, Timeline, Volume) is fetched in a single atomic payload to prevent partial hydration states.
  - **Auto-Reconnection**: SSE connection automatically attempts to reconnect upon network interruption.
  - **User Feedback**: Non-intrusive `SnackBar` notifications inform users of connection loss and restoration.

## Data Flow

1. **Event Generation**: The Backend (`server.js`) generates synthetic events (SLA Breaches, Case Delays, etc.).
2. **Stream Consumption**: The Frontend `DashboardService` connects to the `/stream` endpoint via Server-Sent Events (SSE).
3. **State Update**: `DashboardStore` (SignalStore) subscribes to the stream.
   - **History Events**: Replaces the current event list (initial load via atomic snapshot).
   - **Live Events**: Prepended to the event list (immutable update).
4. **Reactive Derivation**: Computed signals (`filteredEvents`, `criticalCount`) automatically update when the event list changes.
5. **Visualization Update**: Angular `effect()` blocks detect signal changes and update ECharts instances efficiently (using `merge` option to avoid full re-renders).

## Accessibility (A11y)

- **Semantic HTML**: Extensive use of semantic tags (`<nav>`, `<main>`, `<article>`, `<time>`) and appropriate ARIA roles.
- **Keyboard Navigation**: All interactive elements (Charts, Tables, Dialogs) are focusable and navigable via keyboard.
- **Visual Clarity**: High contrast ratios and clear focus indicators.
- **Screen Reader Support**: Use of `aria-label`, `aria-live` regions for real-time updates, and correct list structures for event logs.

## Directory Structure

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
│   ├── routes/             # Express Routes (snapshot, stream)
│   ├── simulation/         # Event Generation Logic
│   ├── utils/              # Helper Utilities
│   ├── app.js              # Express App Setup & Chaos Middleware
│   └── server.js           # Server Entry Point
```

## Scalability Considerations

- **OnPush Change Detection**: Enabled globally to minimize change detection cycles.
- **Signal-Based State**: Granular updates ensure only affected components re-render.
- **ECharts Optimization**: Using `canvas` renderer and `merge` mode for high-performance charting.
- **Stateless Backend**: SSE connections are unidrektional and lightweight, suitable for horizontal scaling (requires sticky sessions or a message broker like Redis Main/Sub for multi-instance broadcasting).
