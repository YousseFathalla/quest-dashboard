import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { TitleCasePipe } from '@angular/common';

export interface AnomalySnackbarData {
  title: string;
  severityLabel: string;
}

@Component({
  selector: 'app-anomaly-snackbar',
  imports: [MatIcon, TitleCasePipe],
  template: `
    <div class="flex items-center gap-3 w-fit" matSnackBarLabel>
      <mat-icon class="mat-text-primary-container">warning</mat-icon>
      <div class="flex flex-col gap-1">
        <span class="mat-font-label-lg mat-text-primary-container">
          {{ data.title | titlecase }}
        </span>
        <span class="mat-font-label-sm mat-text-primary-container">
          Severity - {{ data.severityLabel }}
        </span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnomalySnackbar {
  /** Injected data containing title and severity. */
  readonly data = inject<AnomalySnackbarData>(MAT_SNACK_BAR_DATA);
  /** Reference to the snack bar container. */
  readonly snackBarRef = inject(MatSnackBarRef);
}
