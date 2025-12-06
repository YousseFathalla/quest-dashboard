import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { DashboardStore } from "app/store/dashboard.store";


@Component({
  selector: 'app-workflow-header',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './workflow-header.html',
  styleUrl: './workflow-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowHeader {
 protected readonly store = inject(DashboardStore);
}
