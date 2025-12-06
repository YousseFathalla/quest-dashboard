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

  getEventTypeLabel(type: EventType): string {
    return type === 'anomaly' ? 'Critical' : type;
  }

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
