/**
 * @fileoverview Timeline visualization component.
 * Displays a scatter plot of events over time, allowing filtering by event type.
 */

import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import {
  MatCard,
  MatCardHeader,
  MatCardContent,
  MatCardTitle,
  MatCardSubtitle,
} from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import type { EChartsOption } from 'echarts';
import { DashboardStore } from 'app/store/dashboard.store';
import { DashboardFilter } from 'app/models/dashboard.types';
import { SkeletonLoader } from '@shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-time-line',
  imports: [
    NgxEchartsDirective,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatChipsModule,
    MatCardTitle,
    MatCardSubtitle,
    SkeletonLoader,
  ],
  templateUrl: './time-line.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeLine {
  // ✅ 1. Inject Store
  readonly store = inject(DashboardStore);

  // ✅ 2. Define Filters (Matches Store Types)
  /** Available filters for the timeline. */
  readonly filters = signal<DashboardFilter[]>(['all', 'completed', 'pending', 'anomaly']);

  // ✅ 4. Interaction (Delegates to Store)
  /**
   * Handles filter changes. Toggles between specific filter and 'all'.
   * @param {DashboardFilter} filter - The selected filter.
   */
  onFilterChange(filter: DashboardFilter): void {
    const next = this.store.filter() === filter ? 'all' : filter;
    this.store.setFilter(next);
  }


  // ✅ 5. Data Transformation (Aggregated by Hour for Stacked Bar)
  private readonly chartData = computed(() => {
    const events = this.store.visibleEvents();

    // Initialize 24-hour buckets
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      completed: 0,
      pending: 0,
      anomaly: 0,
    }));

    // Aggregate events
    events.forEach(e => {
      const date = new Date(e.timestamp);
      const hour = date.getHours();
      if (hour >= 0 && hour < 24) {
        if (e.type === 'completed') hours[hour].completed++;
        else if (e.type === 'pending') hours[hour].pending++;
        else if (e.type === 'anomaly') hours[hour].anomaly++;
      }
    });

    return {
      categories: hours.map(h => h.hour),
      completed: hours.map(h => h.completed),
      pending: hours.map(h => h.pending),
      anomaly: hours.map(h => h.anomaly),
    };
  });

  // ✅ 6. Chart Options (Reactive Stacked Bar)
  readonly chartOption = computed<EChartsOption>(() => {
    const data = this.chartData();

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }, // Show helpful shadow on hover
        backgroundColor: 'var(--mat-sys-surface-container-highest, #fff)',
        borderColor: 'var(--mat-sys-outline-variant, #ccc)',
        textStyle: { color: 'var(--mat-sys-on-surface, #000)' },
      },
      legend: {
        data: ['Completed', 'Pending', 'Anomalies'],
        bottom: 0,
        textStyle: { color: '#9ca3af' }, // Matches existing gray style
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        splitLine: {
            show: true,
            lineStyle: { color: 'rgba(0,0,0,0.05)' }
        },
        axisLabel: { color: '#9ca3af' },
      },
      yAxis: {
        type: 'category',
        data: data.categories,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#9ca3af' },
        inverse: true, // 00:00 at top
      },
      series: [
        {
          name: 'Completed',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: data.completed,
          itemStyle: { color: '#22c55e' }, // Green
          animationDelay: (idx) => idx * 10,
        },
        {
          name: 'Pending',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: data.pending,
          itemStyle: { color: '#eab308' }, // Yellow
          animationDelay: (idx) => idx * 10 + 100,
        },
        {
          name: 'Anomalies',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: data.anomaly,
          itemStyle: { color: '#ef4444' }, // Red
          animationDelay: (idx) => idx * 10 + 200,
        }
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx) => idx * 5,
    };
  });
}

