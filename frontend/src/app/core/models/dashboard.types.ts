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

export interface HistoryEvent {
  type: 'HISTORY';
  data: DashboardEvent[];
}

export interface StatsEvent {
  type: 'STATS';
  data: DashboardStats;
}

export type WebSocketMessage = DashboardEvent | HistoryEvent | StatsEvent;

// Type guard functions
export function isHistoryEvent(message: WebSocketMessage): message is HistoryEvent {
  return 'type' in message && message.type === 'HISTORY';
}

export function isStatsEvent(message: WebSocketMessage): message is StatsEvent {
  return 'type' in message && message.type === 'STATS';
}

export function isDashboardEvent(message: WebSocketMessage): message is DashboardEvent {
  return !isHistoryEvent(message) && !isStatsEvent(message);
}
