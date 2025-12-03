import { DashboardEvent } from '@core/models/dashboard.types';

export type EventStatus = 'completed' | 'pending' | 'anomaly';
export type EventSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export function getEventStatus(event: DashboardEvent): EventStatus {

  if (event.severity === 'CRITICAL') return 'anomaly';

  const typeLower = event.type.toLowerCase();
  const messageLower = event.message.toLowerCase();
  const completionIndicators = [
    'complete',
    'completed',
    'finished',
    'success',
    'approved',
    'resolved',
    'closed',
    'finalized',
  ];

  if (
    event.severity === 'INFO' &&
    (completionIndicators.some((indicator) => typeLower.includes(indicator)) ||
      completionIndicators.some((indicator) => messageLower.includes(indicator)))
  ) {
    return 'completed';
  }

  return 'pending';
}

export function getStatusColorCircle(status: EventStatus): string {
  switch (status) {
    case 'completed':
      return '#22c55e';
    case 'anomaly':
      return '#ef4444';
    case 'pending':
      return '#eab308';
    default:
      return '#94a3b8';
  }
}
export function getStatusColorForTooltip(status: EventStatus): string {
  switch (status) {
    case 'completed':
      return 'success bg-(--mat-sys-primary)/15';
    case 'anomaly':
      return 'error bg-(--mat-sys-primary)/15';
    case 'pending':
      return 'warning bg-(--mat-sys-primary)/15';
    default:
      return '';
  }
}
export function getTooltipStatusColor(status: EventStatus): string {
  switch (status) {
    case 'completed':
      return 'success mat-text-primary';
    case 'anomaly':
      return 'mat-text-error';
    case 'pending':
      return 'warning mat-text-primary';
    default:
      return 'mat-text-primary';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return 'mat-text-error';
    case 'WARNING':
      return 'warning mat-text-primary';
    case 'INFO':
      return 'info mat-text-primary';
    default:
      return 'mat-text-primary';
  }
}

export function getSeverityEventLog(severity: EventSeverity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'mat-bg-error';
    case 'WARNING':
      return 'warning mat-bg-primary';
    case 'INFO':
      return 'info mat-bg-primary';
    default:
      return 'mat-bg-primary';
  }
}


export function getSeverityEventLogChips(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return 'mat-text-on-error mat-bg-error';
    case 'WARNING':
      return 'warning mat-text-on-primary mat-bg-primary';
    case 'INFO':
      return 'info mat-text-on-primary mat-bg-primary';
    default:
      return 'mat-text-on-primary mat-bg-primary';
  }
}

export function getStatusEventLogDot(status: EventStatus): string {
  switch (status) {
    case 'completed':
      return 'success mat-bg-primary';
    case 'anomaly':
      return 'error mat-bg-error';
    case 'pending':
      return 'warning mat-bg-primary';
    default:
      return 'mat-bg-primary';
  }
}

export function getStatusEventLogChip(status: EventStatus): string {
  switch (status) {
    case 'completed':
      return 'success mat-text-on-primary mat-bg-primary';
    case 'anomaly':
      return 'error mat-text-on-error mat-bg-error';
    case 'pending':
      return 'warning mat-text-on-primary mat-bg-primary';
    default:
      return 'mat-text-on-primary mat-bg-primary';
  }
}

