/**
 * @fileoverview Stats Cards component.
 * Displays summary statistics including SLA Compliance, Avg Cycle Time, Active Anomalies, and Total Workflows.
 */

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { DashboardStore } from 'app/store/dashboard.store';
import { DurationPipe } from '@core/pipes/duration.pipe';

@Component({
  selector: 'app-stats-cards',
  imports: [MatCard, MatCardContent, MatCardHeader, MatCardTitle, DecimalPipe, DurationPipe],
  templateUrl: './stats-cards.html',
  styleUrl: './stats-cards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsCards {
  /** The dashboard store instance. */
  readonly store = inject(DashboardStore);
}
