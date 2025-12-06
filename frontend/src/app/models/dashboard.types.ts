/**
 * @fileoverview Type definitions for the Dashboard application.
 * Contains interfaces for events, statistics, store state, and chart data.
 */

/**
 * Represents the type of a workflow event.
 */
export type EventType = 'completed' | 'pending' | 'anomaly';

/**
 * Represents the severity of an anomaly.
 * Can be 'normal', 'high', or a numeric level (1-5).
 */
export type Severity = 'normal' | 'high' | number; // Backend sends numbers for anomaly

/**
 * Filter options for the dashboard events.
 */
export type DashboardFilter = EventType | 'all';
export type ConnectionState = 'connecting' | 'connected' | 'disconnected';

/**
 * Represents a single log event in the system.
 */
export interface LogEvent {
  /** Unique identifier for the event. */
  id: string;
  /** Timestamp of the event in milliseconds. */
  timestamp: number;
  /** The type of event (completed, pending, or anomaly). */
  type: EventType;
  /** Severity level, applicable if the event is an anomaly. */
  severity?: Severity;
  /** Cycle time in minutes, applicable if the event is completed. */
  cycleTime?: number;
}

/**
 * Aggregated statistics for the dashboard overview.
 */
export interface OverviewStats {
  /** Percentage of SLA compliance. */
  slaCompliance: number;
  /** Average cycle time in minutes. */
  cycleTime: number;
  /** Count of currently active anomalies. */
  activeAnomalies: number;
  /** Total number of workflows processed today. */
  totalWorkflowsToday: number;
}

/**
 * Represents a cell in the heatmap visualization.
 */
export interface HeatmapCell {
  /** The hour of the day (0-23). */
  hour: number;
  /** The severity level. */
  severity: number;
  /** The count of anomalies for this hour and severity. */
  count: number;
}

/**
 * Represents the current connection state of the real-time stream.
 */
export type ConnectionState = 'connecting' | 'connected' | 'disconnected';

/**
 * The main state interface for the Dashboard Store.
 */
export interface DashboardState {
  /** List of recent log events. */
  events: LogEvent[];
  /** Current overview statistics. */
  stats: OverviewStats;
  /** Indicates if the initial data is loading. */
  loading: boolean;
  /** Current filter applied to the event list. */
  filter: DashboardFilter;
  /** Status of the SSE connection. */
  connectionState: ConnectionState;
  /** Indicates if the stream is manually paused by the user. */
  isPaused: boolean;
  /** Indicates if the stream should be active. */
  isStreamActive: boolean;
}


/**
 * Data point format for ECharts visualizations.
 */
export interface ChartDataPoint {
  /** Name of the data point. */
  name: string;
  /** Array containing [Timestamp, Value/Jitter]. */
  value: [number, number]; // [Timestamp, JitterY]
  /** The type of event. */
  type: string;
  /** Severity level of the event. */
  severity: number | string;
  /** Timestamp of the event. */
  timestamp: number;
  /** Style configuration for the data point. */
  itemStyle: { color: string; borderColor?: string; borderWidth?: number };
}
