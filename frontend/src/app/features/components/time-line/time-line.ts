import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
import { ChartDataPoint, DashboardFilter, LogEvent } from 'app/models/dashboard.types';

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
  ],
  templateUrl: './time-line.html',
  styleUrl: './time-line.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeLine {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  // ✅ 1. Inject Store
  readonly store = inject(DashboardStore);

  // ✅ 2. Define Filters (Matches Store Types)
  readonly filters = signal<DashboardFilter[]>(['all', 'completed', 'pending', 'anomaly']);

  // ✅ 3. Responsive Logic
  private readonly windowWidth = signal<number>(0);
  private readonly isMobile = computed(() => this.windowWidth() <= 640);
  private readonly pointSize = computed(() => (this.isMobile() ? 10 : 14));

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth.set(window.innerWidth);
      const resizeObserver = new ResizeObserver((entries) => {
        this.windowWidth.set(entries[0].contentRect.width);
      });
      resizeObserver.observe(document.body);
      this.destroyRef.onDestroy(() => resizeObserver.disconnect());
    }
  }

  // ✅ 4. Interaction (Delegates to Store)
  onFilterChange(filter: DashboardFilter): void {
    const next = this.store.filter() === filter ? 'all' : filter;
    this.store.setFilter(next);
  }

  // ✅ 5. Data Transformation (Computed = Efficient)
  private readonly chartData = computed<ChartDataPoint[]>(() => {
    const events = this.store.visibleEvents();

    // Group by timestamp to handle collisions (Visual Jitter)
    const groups = new Map<number, LogEvent[]>();
    events.forEach((e) => {
      if (!groups.has(e.timestamp)) groups.set(e.timestamp, []);
      groups.get(e.timestamp)!.push(e);
    });

    // Flatten to Chart Points
    return Array.from(groups.entries()).flatMap(([ts, group]) => {
      return group.map((e, index) => {
        // Jitter Y-axis slightly so points don't overlap perfectly
        const jitterY = 0.5 + (index - (group.length - 1) / 2) * 0.15;

        return {
          name: `Event #${e.id}`,
          value: [e.timestamp, jitterY],
          type: e.type,
          severity: e.severity || 1,
          timestamp: e.timestamp,
          itemStyle: {
            color: this.getStatusColor(e.type),
            borderColor: this.getSeverityColor(e.severity),
            borderWidth: this.isHighSeverity(e.severity) ? 2 : 0,
          },
        };
      });
    });
  });

  // ✅ 6. Chart Options (Reactive)
  readonly chartOption = computed<EChartsOption>(() => {
    const mobile = this.isMobile();
    const size = this.pointSize();

    return {
      backgroundColor: 'transparent',
      grid: {
        left: mobile ? 40 : 60,
        right: mobile ? 10 : 20,
        top: 20,
        bottom: 40,
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => this.getTooltipHtml(params.data),
        backgroundColor: 'var(--mat-sys-surface-container-highest, #fff)',
        borderColor: 'var(--mat-sys-outline-variant, #ccc)',
        borderWidth: 1,
        padding: 12,
        extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
      },
      xAxis: {
        type: 'time',
        boundaryGap: ['2%', '2%'],
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: '#9ca3af',
          fontSize: mobile ? 10 : 12,
          formatter: '{HH}:{mm}:{ss}',
        },
      },
      yAxis: {
        type: 'value',
        show: false, // Y-axis is purely for visual jitter
        min: 0,
        max: 1,
      },
      dataZoom: [
        { type: 'inside', xAxisIndex: 0, zoomOnMouseWheel: true },
        {
          type: 'slider',
          show: !mobile,
          height: 16,
          bottom: 10,
          borderColor: 'transparent',
          backgroundColor: '#f1f5f9',
          fillerColor: 'rgba(100, 116, 139, 0.2)',
        },
      ],
      series: [
        {
          type: 'scatter',
          symbol: 'circle',
          symbolSize: size,
          data: this.chartData(),
          animationDelay: (idx) => idx * 2, // Smooth entry
        },
      ],
    };
  });

  // --- Helpers (Inlined for Stability) ---

  private getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return '#22c55e'; // Green
      case 'pending':
        return '#eab308'; // Yellow
      case 'anomaly':
        return '#ef4444'; // Red
      default:
        return '#94a3b8'; // Gray
    }
  }

  private isHighSeverity(severity?: number | string): boolean {
    if (typeof severity === 'number') return severity > 3;
    return severity === 'high';
  }

  private getSeverityColor(severity?: number | string): string {
    return this.isHighSeverity(severity) ? '#b91c1c' : 'transparent';
  }

  private getTooltipHtml(data: ChartDataPoint): string {
    if (!data) return '';
    const date = new Date(data.timestamp);
    const severityClass = this.isHighSeverity(data.severity) ? 'text-warn' : '';

    return `
      <div class="timeline-tooltip">
        <div class="tooltip-header" style="color: ${data.itemStyle.color}">
          ${data.type.toUpperCase()}
        </div>
        <div class="tooltip-row">
          <span>Time:</span>
          <strong>${date.toLocaleTimeString()}</strong>
        </div>
        <div class="tooltip-row">
          <span>Date:</span>
          <span>${date.toLocaleDateString()}</span>
        </div>
        <div class="tooltip-row">
          <span>Severity:</span>
          <span class="${severityClass}">${data.severity}</span>
        </div>
      </div>
    `;
  }
}
