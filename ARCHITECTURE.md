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
- **Real-Time**: Native `ws` WebSocket library
- **Containerization**: Docker (Multi-stage builds)

## Data Flow

1. **Event Generation**: The Backend (`server.js`) generates synthetic events (SLA Breaches, Case Delays, etc.) and broadcasts them via WebSocket.
2. **Stream Consumption**: The Frontend `WebSocketService` connects to the stream and emits `WebSocketMessage` objects.
3. **State Update**: `DashboardStore` (SignalStore) subscribes to the stream.
   - **History Events**: Replaces the current event list (initial load).
   - **Live Events**: Prepended to the event list (immutable update).
4. **Reactive Derivation**: Computed signals (`filteredEvents`, `criticalCount`) automatically update when the event list changes.
5. **Visualization Update**: Angular `effect()` blocks detect signal changes and update ECharts instances efficiently (using `merge` option to avoid full re-renders).

## Directory Structure

frontend/
├── src/
│ ├── app/
│ │ ├── core/
│ │ │ ├── models/ # TypeScript Interfaces
│ │ │ ├── services/ # API & WebSocket Services
│ │ │ └── store/ # SignalStore Definitions
│ │ ├── features/
│ │ │ └── dashboard/
│ │ │ └── components/ # Dumb/Smart Components (Timeline, Heatmap, etc.)
│ │ └── app.ts # Root Component (Orchestrator)
backend/
└── server.js # Mock API & WebSocket Server

## Scalability Considerations

- **OnPush Change Detection**: Enabled globally to minimize change detection cycles.
- **Signal-Based State**: Granular updates ensure only affected components re-render.
- **ECharts Optimization**: Using `canvas` renderer and `merge` mode for high-performance charting.
- **Dockerized**: Ready for horizontal scaling behind a load balancer (requires sticky sessions for WebSockets).
