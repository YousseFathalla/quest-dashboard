import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { DashboardStore } from '@core/store/dashboard.store';
import { Header } from '@layout/header/header';
import { EventLog } from '@features/components/event-log/event-log';
import { HeatMap } from '@features/components/heat-map/heat-map';
import { StatsCards } from '@features/components/stats-cards/stats-cards';
import { TimeLine } from '@features/components/time-line/time-line';
import { VolumeChart } from '@features/components/volume-chart/volume-chart';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-root',
  imports: [
    Header,
    MatIcon,
    MatCard,
    MatCardContent,
    StatsCards,
    TimeLine,
    EventLog,
    HeatMap,
    VolumeChart,
    MatCardHeader,
    MatCardTitle,
    MatDivider
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly store = inject(DashboardStore);

  constructor() {
    // Initialize WebSocket connection on app startup
    this.store.connect();
  }
}
