# Legal Workflow Monitoring Dashboard 🚀

A real-time analytics dashboard for legal operations, designed to provide visibility into workflow health, SLA compliance, and anomalies using a modern, reactive architecture.

## 🚀 Live Demo

- **Frontend Application**: [Live Demo](https://content-luck-production.up.railway.app/)
- **Backend**:
  - [Stream Endpoint](https://quest-dashboard-production-edef.up.railway.app/stream)
  - [Snapshot Endpoint](https://quest-dashboard-production-edef.up.railway.app/snapshot)

- **Required Endpoints**:
  - [/stats/overview](https://quest-dashboard-production-edef.up.railway.app/stats/overview)
  - [/stats/timeline](https://quest-dashboard-production-edef.up.railway.app/stats/timeline)
  - [/stats/anomalies](https://quest-dashboard-production-edef.up.railway.app/stats/anomalies)

### Available Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/stream` | `GET` (SSE) | Real-time event stream including updates for `completed`, `pending`, and `anomaly` events. |
| `/snapshot` | `GET` | Fetches the initial state of the dashboard, including historical events and overview statistics. |

## 🏆 Challenge Compliance Matrix

We have meticulously implemented every requirement of the coding challenge, plus all "Optional" and "Bonus" features.

| Challenge Step | Status | Implementation Details |
| :--- | :---: | :--- |
| **1. Mock API** | ✅ | Node.js/Express backend with `chaosMiddleware` (5% errors) and custom event generator. |
| **2. Real-Time Dashboard** | ✅ | Angular 21 app with 4 reactive widgets (Timeline, Cards, Heatmap, Volume). |
| **3. Interactions** | ✅ | Global filters (6h/12h/24h), "Pause/Resume" stream, type toggles, and smooth ECharts transitions. |
| **4. State Management** | ✅ | **NgRx SignalStore** (v21+) with **Redux DevTools** integration for debugging. |
| **5. Deployment** | ✅ | Dockerized (Frontend + Backend + Nginx) and deployed to **Railway**. |
| **6. Bonus Features** | ✅ | Dark Mode, Toast Notifications, Global Refresh, Custom Animations. |

### 🌟 Bonus Features Delivered (+15%)

- ✅ **Real-time Toast Notifications**: Non-intrusive alerts for connection status and detailed error messages.
- ✅ **Dark Mode**: Fully supported via TailwindCSS and Angular Material theming.
- ✅ **Pause/Resume Live Updates**: User control over the SSE stream directly from the header.
- ✅ **Global Refresh**: Manual re-fetch capability to sync instant data.
- ✅ **Simulated 5% Error Rate**: Backend "Chaos Monkey" middleware to demonstrate robust frontend error handling.
- ✅ **Custom Animations**: Smooth transitions for list items and chart updates.

### 🐳 DevOps & Deployment (Step 5)

- **One-Command Start**: `docker-compose -f docker-compose.dev.yml up --build` runs the full stack.
- **Live Demo**: Hosted on Railway (links above).
- **CI/CD**: Docker-ready architecture suitable for GitHub Actions.

## ⚡ Key Features

- **Real-Time Event Stream**: Live Server-Sent Events (SSE) integration processing events with sub-second latency.
- **Reactive State Management**: Powered by **Angular Signals** and **NgRx SignalStore** (v21) for predictable, unidirectional data flow. Fully integrated with **Redux DevTools** for state inspection and time-travel debugging.
- **Performance-First Architecture**:
  - **Deferrable Views (`@defer`)**: Critical components (Heatmap, Event Log) are lazy-loaded based on viewport visibility to optimize Time-to-Interactive (TTI).
  - **OnPush Change Detection**: Global strategy enabling efficient rendering cycles.
- **Robust Quality Assurance**:
  - **Property-Based Testing**: Utilizes `fast-check` to fuzz-test utility functions against thousands of random inputs.

## 📂 Project Structure

For a detailed breakdown of the directory structure and architectural decisions, please see [ARCHITECTURE.md](ARCHITECTURE.md).

```text
quest-dashboard/
├── backend/                # Node.js API & Simulation Engine
│   ├── src/
│   │   ├── data/           # Store Data
│   │   ├── simulation/     # Data generation logic
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Stream management
│   └── app.js              # Main Application
│   └── server.js           # Main Server
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

## 🧪 Testing

This project uses [Vitest](https://vitest.dev/) as the unit test runner for the Angular 21 frontend application, complemented by [Fast-check](https://fast-check.dev/) for property-based testing.

To run the unit tests, navigate to the `frontend` directory and execute:

```bash
cd frontend
npm test
```

To run end-to-end tests:

```bash
cd frontend
npm run e2e
```

### ⚙️ Environment Variables

The application supports the following environment variables for configuration:

| Service | Variable | Description | Default |
| :--- | :--- | :--- | :--- |
| **Backend** | `PORT` | Port number for the API server | `3000` |
| **Backend** | `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| **Backend** | `CORS_ORIGIN` | Allowed frontend origin for CORS | `*` |
| **Frontend** | `NG_APP_API_URL` | Base URL for the backend API | `http://localhost:3000` |

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
- **Path Aliases**: Clean imports using `tsconfig.json` shortcuts (e.g., `@core/`, `@features/`, `@shared/`, `@layout/`, `@models/`, `@env/`) for better maintainability.

## 🛡️ License

This project is part of the Expanders360 Hiring Quest.

Build By `Youssef Fathalla`
