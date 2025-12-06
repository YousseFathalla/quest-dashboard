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
  readonly store = inject(DashboardStore);
}

