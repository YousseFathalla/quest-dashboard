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
import { DashboardStore } from '@core/store/dashboard.store';
import { DASHBOARD_CONSTANTS } from '@core/constants/dashboard.constants';

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

  readonly store = inject(DashboardStore);
  readonly timeRanges = DASHBOARD_CONSTANTS.TIME_RANGES;
  updateVolumeOption = signal<EChartsOption>({});

  volumeOption = signal<EChartsOption>({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        if (!params || !params.length) return '';
        const axisValue = params[0].axisValue;
        let content = `<div style="padding: 8px;">`;
        content += `<div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #e2e8f0;">${axisValue}</div>`;

        params.forEach((param: any) => {
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
    // Clean up timeout on component destroy
    this.destroyRef.onDestroy(() => {
      if (this.updateTimeout !== null) {
        clearTimeout(this.updateTimeout);
      }
    });

    effect(() => {
      const events = this.store.filteredEvents();

      // Debounce chart updates for performance
      if (this.updateTimeout !== null) {
        clearTimeout(this.updateTimeout);
      }

      this.updateTimeout = window.setTimeout(() => {
        const volumeMap = new Map<string, { total: number; critical: number }>();

        events.forEach((e) => {
          const hourLabel = new Date(e.timestamp).getHours() + ':00';
          const current = volumeMap.get(hourLabel) || { total: 0, critical: 0 };

          current.total++;
          if (e.severity === 'CRITICAL') current.critical++;

          volumeMap.set(hourLabel, current);
        });

        const sortedHours = Array.from(volumeMap.keys()).sort();

        this.updateVolumeOption.set({
          xAxis: { data: sortedHours },
          series: [
            { data: sortedHours.map((h) => volumeMap.get(h)?.total || 0) },
            { data: sortedHours.map((h) => volumeMap.get(h)?.critical || 0) },
          ],
        });
        this.updateTimeout = null;
      }, DASHBOARD_CONSTANTS.CHART_UPDATE_DEBOUNCE_MS);
    });
  }

  onTimeRangeChange(event: MatButtonToggleChange): void {
    if (event.value) {
      this.store.updateTimeRange(event.value as '6h' | '12h' | '24h');
    }
  }
}
