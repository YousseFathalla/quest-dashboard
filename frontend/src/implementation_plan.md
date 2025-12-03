# Implementation Plan - Legal Workflow Monitoring Dashboard

This plan outlines the steps to complete the remaining requirements for the Legal Workflow Monitoring & Anomaly Detection Dashboard, achieving 100% completion including bonus features and backend refactoring.

## User Review Required
> [!IMPORTANT]
> **Backend Refactoring**: The backend will be restructured from a single [server.js](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/backend/server.js) file into a modular architecture. This will require restarting the backend server.
> **Dark Mode**: A global theme toggle will be added. This might require minor adjustments to existing color variables to ensure proper contrast in both modes.

## Proposed Changes

### Phase 1: Frontend - Core Gaps & Bonus Features

#### [MODIFY] [time-line.ts](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/frontend/src/app/features/components/time-line/time-line.ts) & [time-line.html](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/frontend/src/app/features/components/time-line/time-line.html)
- **Goal**: Implement Timeline Category Filter.
- **Changes**:
    - Add a dropdown/selector to filter events by type (`NEW_CASE`, `WORKFLOW_COMPLETE`, `SLA_BREACH`, `CASE_DELAY`).
    - Update the ECharts option dynamically based on the selected filter.

#### [MODIFY] [heat-map.ts](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/frontend/src/app/features/components/heat-map/heat-map.ts) & [heat-map.html](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/frontend/src/app/features/components/heat-map/heat-map.html)
- **Goal**: Implement Anomaly Type Toggle.
- **Changes**:
    - Add a toggle/checkbox to filter anomalies by severity (`WARNING`, `CRITICAL`).
    - Filter the data passed to the heatmap chart.

#### [NEW] [toast.service.ts](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/frontend/src/app/core/services/toast.service.ts)
- **Goal**: Implement Real-time Toast Notifications.
- **Changes**:
    - Create a service wrapping Angular Material's `MatSnackBar`.
    - Subscribe to the `WebSocketService` event stream.
    - Trigger a toast notification when a `CRITICAL` or `SLA_BREACH` event is received.

#### [NEW] [theme.service.ts](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/frontend/src/app/core/services/theme.service.ts)
- **Goal**: Implement Dark Mode.
- **Changes**:
    - Create a service to manage the active theme (light/dark).
    - Use Angular Signals to expose the current theme state.
    - Persist preference in `localStorage`.
    - Apply a `.dark-theme` class to the `body` or root element.

#### [MODIFY] [header.component.ts](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/frontend/src/app/layout/header/header.component.ts) & [header.component.html](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/frontend/src/app/layout/header/header.component.html)
- **Goal**: Add Global Controls (Theme Toggle, Pause/Resume, Refresh).
- **Changes**:
    - Add a "Dark Mode" toggle switch.
    - Add a "Pause/Resume" button to control the WebSocket stream (or ignore updates).
    - Add a "Refresh" button to manually reload data.

### Phase 2: Backend Refactoring

#### [NEW] [backend structure]
- **Goal**: Modularize the backend.
- **Files**:
    - `backend/src/app.js`: Express app setup and middleware.
    - `backend/src/server.js`: Server entry point (HTTP + WebSocket).
    - `backend/src/routes/stats.routes.js`: API endpoints for stats.
    - `backend/src/services/data.service.js`: Mock data generation and state management.
    - `backend/src/services/websocket.service.js`: WebSocket logic and broadcasting.
    - `backend/src/utils/helpers.js`: Utility functions.

#### [DELETE] [server.js](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/backend/server.js)
- **Goal**: Remove the monolithic file after refactoring.

### Phase 3: DevOps & Documentation

#### [NEW] [.github/workflows/ci.yml](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/.github/workflows/ci.yml)
- **Goal**: Implement Basic CI Pipeline.
- **Changes**:
    - Define a GitHub Actions workflow to run `npm install`, `npm run build` (frontend), and potentially `npm test` (if tests exist/are added).

#### [MODIFY] [README.md](file:///c:/Users/Youss/OneDrive/Desktop/quest-dashboard/README.md)
- **Goal**: Add Deployment Instructions.
- **Changes**:
    - Add a section on how to deploy using Docker.
    - Add a section on how to deploy to a service like Railway or Render (generic instructions).

## Verification Plan

### Automated Tests
- Run `npm run build` in `frontend` to ensure no build errors.
- Run `npm start` in `backend` to ensure the refactored backend starts correctly.

### Manual Verification
1.  **Filters**:
    - Open the dashboard.
    - Select "SLA_BREACH" in the Timeline filter -> Verify only breaches are shown.
    - Toggle "CRITICAL" only in Heatmap -> Verify only critical anomalies are shown.
2.  **Toasts**:
    - Wait for a critical event (or trigger one via backend console if possible, or just wait as they are frequent).
    - Verify a toast appears at the bottom/top of the screen.
3.  **Dark Mode**:
    - Click the Dark Mode toggle.
    - Verify the UI colors invert/change appropriately.
    - Reload the page -> Verify the theme persists.
4.  **Controls**:
    - Click "Pause" -> Verify the timeline stops updating.
    - Click "Resume" -> Verify updates continue.
    - Click "Refresh" -> Verify data reloads.
5.  **Backend**:
    - Verify API endpoints (`/stats/overview`, etc.) still return correct data.
    - Verify WebSocket connection is established and streaming data.
