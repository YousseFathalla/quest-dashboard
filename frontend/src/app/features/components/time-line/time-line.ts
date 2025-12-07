import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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
  // Inject Store
  readonly store = inject(DashboardStore);

  // Define Filters (Matches Store Types)
  /** Available filters for the timeline. */
  readonly filters = signal<DashboardFilter[]>(['all', 'completed', 'pending', 'anomaly']);

  // Interaction (Delegates to Store)
  /**
   * Handles filter changes. Toggles between specific filter and 'all'.
   * @param {DashboardFilter} filter - The selected filter.
   */
  onFilterChange(filter: DashboardFilter): void {
    const next = this.store.filter() === filter ? 'all' : filter;
    this.store.setFilter(next);
  }

  // Data Transformation (Aggregated by Hour for Stacked Bar)
  private readonly chartData = computed(() => {
    const events = this.store.visibleEvents();
    const now = new Date();

    // Anchor to the start of the current hour to ensure stable buckets
    // This removes 'minute' drift and ensures we always bucket by [HH:00 - HH:59]
    const anchor = new Date(now);
    anchor.setMinutes(0, 0, 0);

    const mp = new Map<number, number>(); // timestamp (start of hour) -> index in boxes
    const boxes: { label: string; completed: number; pending: number; anomaly: number }[] = [];

    // Build 24 buckets: [Current-23h, ... , Current]
    // We iterate backwards from 23 down to 0 so the array is chronological
    for (let i = 23; i >= 0; i--) {
      const d = new Date(anchor.getTime() - i * 60 * 60 * 1000);
      const label = `${d.getHours().toString().padStart(2, '0')}:00`;

      boxes.push({ label, completed: 0, pending: 0, anomaly: 0 });
      // Map the exact timestamp of the hour start to the array index
      mp.set(d.getTime(), boxes.length - 1);
    }

    events.forEach((e) => {
      // Floor the event time to its hour start
      const d = new Date(e.timestamp);
      d.setMinutes(0, 0, 0);
      const key = d.getTime();

      // only count if it matches one of our active buckets
      const idx = mp.get(key);
      if (idx !== undefined) {
        const box = boxes[idx];
        if (e.type === 'completed') box.completed++;
        else if (e.type === 'pending') box.pending++;
        else if (e.type === 'anomaly') box.anomaly++;
      }
    });

    return {
      categories: boxes.map((b) => b.label),
      completed: boxes.map((b) => b.completed),
      pending: boxes.map((b) => b.pending),
      anomaly: boxes.map((b) => b.anomaly),
    };
  });

  // Chart Options (Reactive Stacked Bar)
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
          lineStyle: { color: 'rgba(0,0,0,0.05)' },
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
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx) => idx * 5,
    };
  });
}
