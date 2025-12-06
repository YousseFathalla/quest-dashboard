import {
  Component,
  effect,
  inject,
  signal,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import {
  MatButtonToggleGroup,
  MatButtonToggle,
  MatButtonToggleChange,
} from '@angular/material/button-toggle';
import type { EChartsOption } from 'echarts';
import { DashboardStore } from 'app/store/dashboard.store';
import { DASHBOARD_CONSTANTS } from '@core/constants/dashboard.constants';
import { LogEvent } from '@models/dashboard.types';

type TimeRange = '6h' | '12h' | '24h';

@Component({
  selector: 'app-volume-chart',
  imports: [
    NgxEchartsDirective,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatButtonToggleGroup,
    MatButtonToggle,
  ],
  templateUrl: './volume-chart.html',
  styleUrl: './volume-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumeChart {
  private readonly destroyRef = inject(DestroyRef);
  private updateTimeout: ReturnType<typeof setTimeout> | null = null;

  protected readonly store = inject(DashboardStore);
  protected readonly timeRanges: TimeRange[] = ['6h', '12h', '24h'];
  protected readonly selectedTimeRange = signal<TimeRange>('24h');
  protected readonly updateVolumeOption = signal<EChartsOption>({});


  protected readonly volumeOption = signal<EChartsOption>({
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const p = params as Array<{
          axisValue?: string;
          value?: number;
          seriesName?: string;
          color?: string;
        }>;
        if (!p || !p.length) return '';
        const axisValue = p[0].axisValue;
        let content = `<div style="padding: 8px;">`;
        content += `<div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #e2e8f0;">${axisValue}</div>`;

        p.forEach((param) => {
          const value = param.value || 0;
          const seriesName = param.seriesName || '';
          const color = param.color || '#94a3b8';
          content += `
            <div style="font-size: 12px; margin-bottom: 4px; display: flex; align-items: center;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; border-radius: 2px; margin-right: 6px;"></span>
              <span style="color: #94a3b8;">${seriesName}:</span>
              <span style="color: #e2e8f0; font-weight: 600; margin-left: 6px;">${value}</span>
            </div>
          `;
        });

        content += `</div>`;
        return content;
      },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: {
        color: '#e2e8f0',
      },
    },
    legend: {
      data: ['Total Volume', 'Critical Errors'],
      textStyle: { color: '#94a3b8' },
      bottom: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: { color: '#94a3b8' },
    },
    yAxis: [
      { type: 'value', name: 'Volume', position: 'left', splitLine: { show: false } },
      { type: 'value', name: 'Errors', position: 'right', splitLine: { show: false } },
    ],
    series: [
      { name: 'Total Volume', type: 'bar', data: [], itemStyle: { color: '#3b82f6' } },
      {
        name: 'Critical Errors',
        type: 'line',
        yAxisIndex: 1,
        data: [],
        itemStyle: { color: '#ef4444' },
        smooth: true,
      },
    ],
  });


  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.updateTimeout !== null) {
        clearTimeout(this.updateTimeout);
      }
    });

    effect(
      () => {
        const events = this.store.events();
        const timeRange = this.selectedTimeRange();

        if (this.updateTimeout !== null) {
          clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = globalThis.setTimeout(() => {
          const filteredEvents = this.filterEventsByTimeRange(events, timeRange);
          const volumeMap = new Map<string, { total: number; critical: number }>();

          filteredEvents.forEach((e: LogEvent) => {
            const hourLabel = new Date(e.timestamp).getHours() + ':00';
            const current = volumeMap.get(hourLabel) || { total: 0, critical: 0 };

            current.total++;
            if (e.type === 'anomaly') current.critical++;

            volumeMap.set(hourLabel, current);
          });

          // Generate hour labels based on selected time range
          const hoursToShow = this.getHoursForRange(timeRange);

          this.updateVolumeOption.set({
            xAxis: { data: hoursToShow },
            series: [
              { data: hoursToShow.map((h) => volumeMap.get(h)?.total || 0) },
              { data: hoursToShow.map((h) => volumeMap.get(h)?.critical || 0) },
            ],
          });
          this.updateTimeout = null;
        }, DASHBOARD_CONSTANTS.CHART_UPDATE_DEBOUNCE_MS);
      }
    );
  }

  private filterEventsByTimeRange(events: LogEvent[], range: TimeRange): LogEvent[] {
    const hoursMap: Record<TimeRange, number> = {
      '6h': 6,
      '12h': 12,
      '24h': 24,
    };
    const hours = hoursMap[range];
    const cutoffTimestamp = Date.now() - hours * 3600000;
    return events.filter((e) => e.timestamp >= cutoffTimestamp);
  }

  private getHoursForRange(range: TimeRange): string[] {
    const hoursMap: Record<TimeRange, number> = {
      '6h': 6,
      '12h': 12,
      '24h': 24,
    };
    const numHours = hoursMap[range];
    const currentHour = new Date().getHours();
    const hours: string[] = [];

    // Generate hours going back from current hour
    for (let i = numHours - 1; i >= 0; i--) {
      const hour = (currentHour - i + 24) % 24;
      hours.push(`${hour}:00`);
    }

    return hours;
  }

  onTimeRangeChange(event: MatButtonToggleChange): void {
    if (event.value) {
      this.selectedTimeRange.set(event.value as TimeRange);
    }
  }
}
