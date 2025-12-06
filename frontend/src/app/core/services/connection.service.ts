/**
 * @fileoverview Service for managing connection status notifications.
 * Displays snackbars for disconnection, reconnection, and errors.
 */

import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { RetrySnackbar } from '@shared/components/retry-snackbar/retry-snackbar';

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private readonly snackBar = inject(MatSnackBar);
  private snackBarRef: MatSnackBarRef<RetrySnackbar> | null = null;
  private hasShownDisconnect = false;

  /**
   * Displays a persistent snackbar indicating that the stream is disconnected.
   */
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

  /**
   * Displays a success snackbar indicating that the stream has reconnected.
   * Only shows if a disconnection message was previously shown.
   */
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

  /**
   * Displays a general error message in a snackbar.
   *
   * @param {string} message - The error message to display.
   */
  showError(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
      panelClass: ['snackbar-error', 'error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  /**
   * Dismisses the currently active snackbar, if any.
   */
  private dismissSnackbar(): void {
    this.snackBarRef?.dismiss();
    this.snackBarRef = null;
  }
}
