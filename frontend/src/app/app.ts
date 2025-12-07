/**
 * @fileoverview Main Application Component.
 * Orchestrates the layout of dashboard widgets including Stats Cards, Timeline, Heatmap, Volume Chart, and Event Log.
 */

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DashboardStore } from 'app/store/dashboard.store';
import { Header } from '@layout/header/header';
import { EventLog } from '@features/components/event-log/event-log';
import { StatsCards } from '@features/components/stats-cards/stats-cards';
import { TimeLine } from '@features/components/time-line/time-line';
import { MatDivider } from '@angular/material/divider';
import { WorkflowHeader } from '@features/components/workflow-header/workflow-header';
import { HeatMap } from '@features/components/heat-map/heat-map';
import { VolumeChart } from '@features/components/volume-chart/volume-chart';
import { SkeletonLoader } from "@shared/components/skeleton-loader/skeleton-loader";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  imports: [
    Header,
    StatsCards,
    TimeLine,
    EventLog,
    MatDivider,
    WorkflowHeader,
    HeatMap,
    VolumeChart,
    SkeletonLoader,
    MatProgressSpinnerModule,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** The global dashboard store instance. */
  readonly store = inject(DashboardStore);
}
