import { DashboardState } from "@models/dashboard.types";


export const initialState: DashboardState = {
  events: [],
  stats: {
    slaCompliance: 0,
    cycleTime: 0,
    activeAnomalies: 0,
    totalWorkflowsToday: 0,
  },
  loading: true,
  filter: 'all',
  connectionState: 'connecting',
  isPaused: false,
  isStreamActive: true,
  error: null,
};
