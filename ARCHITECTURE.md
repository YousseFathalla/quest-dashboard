# System Architecture

## Overview

The Legal Workflow Monitoring Dashboard is a real-time analytics platform designed to provide visibility into legal operations. It uses a reactive architecture to process high-frequency event streams and visualize them instantly.

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

frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/           # TypeScript Interfaces (LogEvent, OverviewStats)
│   │   │   ├── services/         # API & SSE Services (DashboardService, ConnectionService)
│   │   │   └── store/            # SignalStore Definitions (DashboardStore)
│   │   ├── features/
│   │   │   └── dashboard/
│   │   │       ├── components/   # Smart/Presentation Components (Heatmap, Timeline, etc.)
│   │   │       └── utils/        # Shared Utilities (e.g., heatmap.utils.ts)
│   │   └── app.ts                # Root Component (Orchestrator)
backend/
├── src/
│   ├── routes/                   # Express Routes (stats, stream)
│   ├── simulation/               # Event Generation Logic
│   └── app.js                    # Express App Setup & Chaos Middleware
└── server.js                     # Server Entry Point

## Scalability Considerations

- **OnPush Change Detection**: Enabled globally to minimize change detection cycles.
- **Signal-Based State**: Granular updates ensure only affected components re-render.
- **ECharts Optimization**: Using `canvas` renderer and `merge` mode for high-performance charting.
- **Stateless Backend**: SSE connections are unidrektional and lightweight, suitable for horizontal scaling (requires sticky sessions or a message broker like Redis Main/Sub for multi-instance broadcasting).
