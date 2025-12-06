/**
 * @fileoverview Dialog component for displaying heatmap details.
 * Shows a list of anomalies for a specific time slot and severity.
 */

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LogEvent, EventType, Severity } from '@models/dashboard.types';
import { getStatusEventLogDot, getStatusEventLogChip } from '@shared/utilities/event-status.utils';

export interface HeatmapDetailsDialogData {
  timeSlot: string;
  eventType: EventType;
  events: LogEvent[];
}

@Component({
  selector: 'app-heatmap-details-dialog',
  imports: [MatDialogModule, MatButtonModule, DatePipe, MatIconModule],
  templateUrl: './heatmap-details-dialog.html',
  styleUrl: './heatmap-details-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatmapDetailsDialog {
  readonly dialogRef = inject(MatDialogRef<HeatmapDetailsDialog>);
  readonly data = inject<HeatmapDetailsDialogData>(MAT_DIALOG_DATA);
  readonly getStatusDot = getStatusEventLogDot;
  readonly getStatusChip = getStatusEventLogChip;

  /**
   * Returns a display label for the event type.
   * @param {EventType} type - The event type.
   * @returns {string} The display label.
   */
  getEventTypeLabel(type: EventType): string {
    return type === 'anomaly' ? 'Critical' : type;
  }

  /**
   * Returns the CSS class for the severity icon.
   * @param {Severity} [severity] - The severity level.
   * @returns {string} CSS class string.
   */
  getSeverityIconClass(severity: Severity | undefined): string {
    if (severity === undefined) return 'warning mat-text-primary'; // Default/Warning

    let val: number;
    if (typeof severity === 'number') {
      val = severity;
    } else {
      val = severity === 'high' ? 5 : 1;
    }

    if (val >= 4) return 'mat-text-error';
    if (val === 3) return 'orange mat-text-primary';
    return 'warning mat-text-primary';
  }

  /**
   * Returns the CSS color class based on severity.
   * @param {Severity} [severity] - The severity level.
   * @returns {string} CSS class string.
   */
  getSeverityColor(severity: Severity | undefined): string {
    if (severity === undefined) return 'warning mat-text-on-primary mat-bg-primary'; // Default

    let val: number;
    if (typeof severity === 'number') {
      val = severity;
    } else {
      val = severity === 'high' ? 5 : 1;
    }

    if (val >= 4) return 'mat-text-on-error mat-bg-error';
    if (val === 3) return 'orange mat-text-on-primary mat-bg-primary';
    return 'warning mat-text-on-primary mat-bg-primary';
  }

  /**
   * Returns a human-readable severity label.
   * @param {Severity} [severity] - The severity level.
   * @returns {string} Severity label (e.g., "Severity 3").
   */
  getSeverityLabel(severity: Severity | undefined): string {
    let val: number;
    if (severity === undefined) val = 0;
    else if (typeof severity === 'number') {
      val = severity;
    } else {
      val = severity === 'high' ? 5 : 1;
    }
    return `Severity ${val}`;
  }
}
