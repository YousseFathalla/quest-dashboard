export type EventStatus = 'completed' | 'pending' | 'anomaly';
export type EventSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

/**
 * Returns the hex color code for a status circle.
 *
 * @param {EventStatus} status - The status of the event.
 * @returns {string} Hex color string.
 */
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

/**
 * Returns the CSS classes for tooltip background based on status.
 *
 * @param {EventStatus} status - The status of the event.
 * @returns {string} CSS class string.
 */
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

/**
 * Returns the CSS classes for tooltip text color based on status.
 *
 * @param {EventStatus} status - The status of the event.
 * @returns {string} CSS class string.
 */
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

/**
 * Returns the CSS classes for severity text color.
 *
 * @param {string} severity - The severity level (e.g., 'CRITICAL').
 * @returns {string} CSS class string.
 */
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

/**
 * Returns the CSS classes for event log severity background.
 *
 * @param {EventSeverity} severity - The severity level.
 * @returns {string} CSS class string.
 */
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

/**
 * Returns the CSS classes for event log severity chips (text and background).
 *
 * @param {string} severity - The severity level.
 * @returns {string} CSS class string.
 */
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

/**
 * Returns the CSS classes for a status dot in the event log.
 *
 * @param {EventStatus} status - The event status.
 * @returns {string} CSS class string.
 */
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

/**
 * Returns the CSS classes for a status chip in the event log.
 *
 * @param {EventStatus} status - The event status.
 * @returns {string} CSS class string.
 */
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
