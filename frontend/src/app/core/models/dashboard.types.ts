export type EventSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface DashboardEvent {
  id: number;
  type: string;
  severity: EventSeverity;
  timestamp: string;
  message: string;
}

export interface DashboardStats {
  totalWorkflows: number;
  averageCycleTime: string;
  slaCompliance: number;
  activeAnomalies: number;
}
