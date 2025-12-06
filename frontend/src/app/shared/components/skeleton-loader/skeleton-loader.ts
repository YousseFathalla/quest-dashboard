import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  imports: [],
  template: `
    <div class="w-full h-full animate-pulse">
      <div class="w-full h-full mat-bg-surface-container-low"></div>
    </div>
  `,
  host: {
    class:
      'absolute inset-0 z-50 w-full h-full mat-corner-lg  overflow-hidden mat-bg-surface-container-highest',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoader {}
