/**
 * @fileoverview Workflow Header component.
 * Displays the header section of the workflow dashboard, including title and action buttons.
 */

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
 /** Reference to the DashboardStore for accessing state and actions. */
 protected readonly store = inject(DashboardStore);
}
