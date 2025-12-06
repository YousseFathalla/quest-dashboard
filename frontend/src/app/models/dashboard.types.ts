export type EventType = 'completed' | 'pending' | 'anomaly';
export type Severity = 'normal' | 'high' | number; // Backend sends numbers for anomaly
export type DashboardFilter = EventType | 'all';
export type ConnectionState = 'connecting' | 'connected' | 'disconnected';

export interface LogEvent {
  id: string;
  timestamp: number;
  type: EventType;
  severity?: Severity;
  cycleTime?: number;
}

export interface OverviewStats {
  slaCompliance: number;
  cycleTime: number;
  activeAnomalies: number;
  totalWorkflowsToday: number;
}

export interface HeatmapCell {
  hour: number;
  severity: number;
  count: number;
}

export interface ChartDataPoint {
  name: string;
  value: [number, number]; // [Timestamp, JitterY]
  type: string;
  severity: number | string;
  timestamp: number;
  itemStyle: { color: string; borderColor?: string; borderWidth?: number };
}

export interface DashboardState {
  events: LogEvent[];
  stats: OverviewStats;
  loading: boolean;
  filter: DashboardFilter;
  connectionState: ConnectionState;
  isPaused: boolean;
  isStreamActive: boolean;
  error: string | null;
}
