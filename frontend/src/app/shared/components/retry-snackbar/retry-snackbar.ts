import { ChangeDetectionStrategy, Component, Signal, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface RetrySnackbarData {
  message: string;
  icon: string;
  countdown?: Signal<number>;
}

@Component({
  selector: 'app-retry-snackbar',
  imports: [MatIcon],
  template: `
    <div class="flex items-center gap-2" matSnackBarLabel>
      <mat-icon class="mat-text-primary-container">
        {{ data.icon }}
      </mat-icon>
      <span>
        @if (data.countdown) {
          {{ data.message }} {{ data.countdown() }}s...
        } @else {
          {{ data.message }}
        }
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex items-center justify-between gap-2 w-full',
  },
})
export class RetrySnackbar {
  readonly data = inject<RetrySnackbarData>(MAT_SNACK_BAR_DATA);
  readonly snackBarRef = inject(MatSnackBarRef);
}
