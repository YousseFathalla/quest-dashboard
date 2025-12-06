import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { LogEvent, Severity } from '@models/dashboard.types';
import { AnomalySnackbar } from '@shared/components/anomaly-snackbar/anomaly-snackbar';

const snackbarConfig: MatSnackBarConfig = {
  panelClass: ['snackbar-error', 'error'],
  horizontalPosition: 'right',
  verticalPosition: 'bottom',
  duration: 5000,
};

@Injectable({ providedIn: 'root' })
export class AnomalyNotificationService {
  private readonly snackBar = inject(MatSnackBar);

  notify(event: LogEvent): void {
    if (event.type !== 'anomaly') return;

    this.snackBar.openFromComponent(AnomalySnackbar, {
      ...snackbarConfig,
      data: {
        title: 'New anomaly detected',
        severityLabel: this.formatSeverity(event.severity),
      },
    });
  }

  private formatSeverity(severity?: Severity): string {
    if (typeof severity === 'number') {
      return `Level ${severity}`;
    }

    if (severity === 'high') {
      return 'High';
    }

    return 'Normal';
  }
}
