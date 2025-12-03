import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { MatButton } from '@angular/material/button';
import { DashboardEvent, EventSeverity } from '@core/models/dashboard.types';
import { formatEventTypeWithAcronyms } from '@core/utils/format.utils';

export interface HeatmapDetailsDialogData {
  timeSlot: string;
  severity: EventSeverity;
  events: DashboardEvent[];
}

@Component({
  selector: 'app-heatmap-details-dialog',
  imports: [
    MatDialogModule,
    MatCard,
    MatCardContent,
    MatChip,
    MatButton,
    DatePipe,
  ],
  templateUrl: './heatmap-details-dialog.html',
  styleUrl: './heatmap-details-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatmapDetailsDialog {
  readonly dialogRef = inject(MatDialogRef<HeatmapDetailsDialog>);
  readonly data = inject<HeatmapDetailsDialogData>(MAT_DIALOG_DATA);
  readonly formatEventType = formatEventTypeWithAcronyms;

  getSeverityColor(severity: EventSeverity): 'warn' | 'primary' | 'accent' {
    switch (severity) {
      case 'CRITICAL':
        return 'warn';
      case 'WARNING':
        return 'accent';
      case 'INFO':
        return 'primary';
      default:
        return 'primary';
    }
  }

  getSeverityDotColor(severity: EventSeverity): string {
    switch (severity) {
      case 'CRITICAL':
        return 'var(--color-error-dot)';
      case 'WARNING':
        return 'var(--color-warning-dot)';
      case 'INFO':
        return 'var(--color-info-dot)';
      default:
        return 'var(--mat-sys-outline-variant)';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}

