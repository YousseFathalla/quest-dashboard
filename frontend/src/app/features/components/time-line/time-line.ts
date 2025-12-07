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
    const now = new Date();

    // Initialize 24-hour buckets for the *past 24 hours*
    // We want the most recent hour (currentHour) at the top (or bottom depending on sort), typically
    // we show the range [currentHour - 23, currentHour].
    // Let's build them in chronological order: [current - 23, ..., current]
    const boxes: { label: string; completed: number; pending: number; anomaly: number }[] = [];

    for (let i = 23; i >= 0; i--) {
        // Calculate the hour for this slot
        const d = new Date(now);
        d.setHours(d.getHours() - i);
        const hour = d.getHours();
        const label = `${hour.toString().padStart(2, '0')}:00`;

        boxes.push({
            label,
            completed: 0,
            pending: 0,
            anomaly: 0
        });
    }

    // A helper to find the correct index based on time difference
    // This assumes events are recent (within last 24h usually).
    // If an event is older than 24h, it will be skipped with this logic.
    const oneHourMs = 3600 * 1000;
    const endTime = now.getTime();

    events.forEach(e => {
       const diff = endTime - e.timestamp;
       // We have 24 buckets: index 0 is oldest (23h ago), index 23 is newest (0h ago).
       // diff is how ms ago it was.
       // hoursAgo = Math.floor(diff / oneHourMs).
       // if hoursAgo is 0 => it goes to index 23.
       // if hoursAgo is 23 => it goes to index 0.

       if (diff >= 0) {
           const hoursAgo = Math.floor(diff / oneHourMs);
           if (hoursAgo >= 0 && hoursAgo < 24) {
               const index = 23 - hoursAgo;
               if (index >= 0 && index < 24) {
                    if (e.type === 'completed') boxes[index].completed++;
                    else if (e.type === 'pending') boxes[index].pending++;
                    else if (e.type === 'anomaly') boxes[index].anomaly++;
               }
           }
       }
    });

    return {
      categories: boxes.map(b => b.label),
      completed: boxes.map(b => b.completed),
      pending: boxes.map(b => b.pending),
      anomaly: boxes.map(b => b.anomaly),
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

