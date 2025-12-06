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
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly store = inject(DashboardStore);
}
