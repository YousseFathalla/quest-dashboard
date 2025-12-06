import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { RetrySnackbar } from '@shared/components/retry-snackbar/retry-snackbar';

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private readonly snackBar = inject(MatSnackBar);
  private snackBarRef: MatSnackBarRef<RetrySnackbar> | null = null;
  private hasShownDisconnect = false;

  /** Call when stream disconnects */
  showDisconnected(): void {
    this.hasShownDisconnect = true;
    this.dismissSnackbar();
    this.snackBarRef = this.snackBar.openFromComponent(RetrySnackbar, {
      data: {
        message: 'Stream disconnected. Reconnecting...',
        icon: 'wifi_off',
      },
      duration: 10000,
      panelClass: ['snackbar-error', 'error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  /** Call when stream reconnects - only shows toast if we previously disconnected */
  showConnected(): void {
    if (!this.hasShownDisconnect) return;

    this.hasShownDisconnect = false;
    this.dismissSnackbar();
    this.snackBarRef = this.snackBar.openFromComponent(RetrySnackbar, {
      data: {
        message: 'Stream connected!',
        icon: 'wifi',
      },
      duration: 3000,
      panelClass: ['snackbar-success', 'success'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
      panelClass: ['snackbar-error', 'error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  private dismissSnackbar(): void {
    this.snackBarRef?.dismiss();
    this.snackBarRef = null;
  }
}
