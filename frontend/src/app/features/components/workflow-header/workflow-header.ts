import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SkeletonLoader } from '@shared/components/skeleton-loader/skeleton-loader';
import { DashboardStore } from 'app/store/dashboard.store';

@Component({
  selector: 'app-workflow-header',
  imports: [MatIconModule, MatButtonModule, SkeletonLoader],
  templateUrl: './workflow-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowHeader {
  /** Reference to the DashboardStore for accessing state and actions. */
  protected readonly store = inject(DashboardStore);
}
