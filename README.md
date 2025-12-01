# Legal Workflow Monitoring Dashboard 🚀

A real-time analytics dashboard for legal operations, built for the **Expanders360 Hiring Quest**.

This solution provides real-time visibility into workflow health, SLA compliance, and anomalies using a modern, reactive architecture.

## ⚡ Features

- **Real-Time Event Stream:** Live WebSocket integration processing events with sub-second latency.
- **Reactive State Management:** Powered by **Angular Signals** and **Ngrx SignalStore** for predictable, unidirectional data flow.
- **Data Intelligence:**
  - **Timeline Visualization:** Auto-scrolling event history using ECharts custom series.
  - **Anomaly Heatmap:** Aggregates critical errors by hour and severity to identify systemic issues.
  - **Hybrid Volume Chart:** Dual-axis visualization comparing total workflow volume vs. critical errors.
- **State-Driven Filtering:** Global time-range filters (6h/12h/24h) managed via SignalStore.
- **Dockerized Deployment:** Full-stack containerization with Nginx and Node.js.

## 🛠️ Tech Stack

- **Frontend:** Angular 21 (Standalone), TailwindCSS, Angular Material
- **State:** @ngrx/signals (SignalStore)
- **Visualization:** Apache ECharts (via ngx-echarts)
- **Backend:** Node.js, Express, Native WebSockets (ws)
- **DevOps:** Docker, Docker Compose, Nginx (Multi-stage builds)

## 🚀 Quick Start (Docker)

Run the entire stack with a single command:

```bash
docker compose up --build
```

Access the dashboard at: **http://localhost**

## 🏗️ Architecture Highlights

### 1. Signal-First State Management

Instead of traditional services, I utilized SignalStore to manage the high-frequency data stream. This ensures:

- **Immutability:** State updates are atomic and predictable.
- **Derived State:** Metrics like `criticalCount` and `filteredEvents` are computed automatically without manual recalculation.
- **Performance:** OnPush change detection is used globally to minimize rendering cycles.

### 2. Optimized Visualization

Charts are configured to support high-frequency updates:

- **Efficient Updates:** Charts only receive "diff" updates rather than full re-renders.
- **Tree-Shaking:** ECharts modules are imported individually (`provideEchartsCore`) to reduce bundle size by ~40%.

### 3. Hybrid Design System

- **TailwindCSS** handles the layout, spacing, and dark-mode theming for rapid development.
- **Angular Material** is integrated for accessible interactive components where strict compliance is needed.

## 📂 Project Structure

```
quest-dashboard/
├── frontend/          # Angular Application (Standalone)
├── backend/           # Node.js Mock API + WebSocket Broadcaster
└── docker-compose.yml # Orchestration logic
```

## 🧹 Clean Up Before You Submit

1. **Stop Docker:** Press `Ctrl+C` in your terminal or run `docker compose down`.
2. **Delete Junk:** Make sure you **delete** the `node_modules` folder if it exists in your root (it shouldn't if you used the gitignore).
3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Final submission: Ready for review"
   # git remote add origin <your-repo-link>
   # git push -u origin master
   ```

## 🗣️ The Final Advice

You are ready.

- You have the **Code** (Angular 21 + Signals).
- You have the **Ops** (Docker Compose).
- You have the **Story** (Legal Health Monitor).

**Is there anything else you want to review—maybe how to explain a specific part of the code in the interview—or are you ready to submit?**

---

Built by **Youssef Fathalla**
