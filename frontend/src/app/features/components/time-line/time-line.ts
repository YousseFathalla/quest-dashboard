import {
  Component,
  effect,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { MatCard, MatCardHeader, MatCardContent, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import type { EChartsOption } from 'echarts';
import { DashboardStore } from '@core/store/dashboard.store';
import { DashboardEvent } from '@core/models/dashboard.types';
import { DASHBOARD_CONSTANTS } from '@core/constants/dashboard.constants';
import { formatEventTypeWithAcronyms, formatMessage } from '@core/utils/format.utils';
import { getEventStatus, getSeverityColor, getStatusColorCircle, getStatusColorForTooltip, getTooltipStatusColor } from '@core/utils/event-status.utils';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private updateTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly store = inject(DashboardStore);
  readonly updateOptions = signal<EChartsOption>({});
  readonly selectedFilter = signal<string>('ALL');
  private readonly windowWidth = signal<number>(0);

  // Responsive sizes based on screen width
  private readonly isMobile = computed(() => this.windowWidth() <= 640);

  private readonly responsiveSize = computed(() => {
    return this.isMobile() ? 12 : 18;
  });

  onFilterChange(value: string): void {
    this.selectedFilter.set(value || 'ALL');
  }

  chartOption = computed<EChartsOption>(() => {
    const mobile = this.isMobile();

    return {
      tooltip: {
        trigger: 'item',
        formatter: this.getTooltipFormatter.bind(this),
        backgroundColor: 'var(--mat-sys-surface-container-highest)',
        borderColor: 'var(--mat-sys-outline-variant)',
        borderWidth: 1,
        textStyle: {
          fontSize: mobile ? 11 : 12,
        },
      },
      backgroundColor: 'transparent',
      grid: {
        left: mobile ? '8%' : '5%',
        right: mobile ? '8%' : '5%',
        bottom: mobile ? '15%' : '10%',
        top: mobile ? '8%' : '10%'
      },
      xAxis: {
        type: 'time',
        splitLine: { show: false },
        axisLabel: {
          color: 'oklch(70.7% 0.022 261.325)',
          fontSize: this.responsiveSize(),
          rotate: mobile ? 45 : 0,
          margin: mobile ? 8 : 10,
        },
        axisLine: {
          lineStyle: {
            color: 'oklch(70.7% 0.022 261.325)',
            width: 1,
          }
        },
        boundaryGap: mobile ? ['8%', '8%'] : ['5%', '5%'],
      },
    yAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: 1,
    },
      series: [
        {
          type: 'scatter',
          symbolSize: this.responsiveSize(),
          itemStyle: {
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            borderColor: 'var(--mat-sys-outline-variant)',
            borderWidth: 1,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 2,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
            },
          },
          data: [],
        },
      ],
    };
  });

  constructor() {
    // Initialize window width and listen for resize
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth.set(window.innerWidth);

      const handleResize = () => {
        this.windowWidth.set(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('resize', handleResize);
      });
    }

    this.destroyRef.onDestroy(() => {
      if (this.updateTimeout !== null) {
        clearTimeout(this.updateTimeout);
      }
    });

    effect(() => {
      const events = this.store.events();

      if (this.updateTimeout !== null) {
        clearTimeout(this.updateTimeout);
      }

      this.updateTimeout = globalThis.setTimeout(() => {
        const filteredEvents = this.filterEvents(events, this.selectedFilter());
        const eventGroups = this.groupEventsByTimestamp(filteredEvents);
        const dataPoints = this.createDataPoints(eventGroups);

        this.updateOptions.set({
          series: [
            {
              data: dataPoints,
            },
          ],
        });
        this.updateTimeout = null;
      }, DASHBOARD_CONSTANTS.CHART_UPDATE_DEBOUNCE_MS);
    });
  }

  private filterEvents(events: DashboardEvent[], filter: string): DashboardEvent[] {
    if (filter === 'ALL') return events;


    return events.filter((e) => {
      const status = getEventStatus(e);
      if (filter === 'COMPLETED') return status === 'completed';
      if (filter === 'ANOMALY') return status === 'anomaly';
      if (filter === 'PENDING') return status === 'pending';
      return false;
    });
  }

  private groupEventsByTimestamp(events: DashboardEvent[]): Map<number, DashboardEvent[]> {
    const eventGroups = new Map<number, DashboardEvent[]>();

    events.forEach((e) => {
      const timestamp = new Date(e.timestamp).getTime();
      const group = eventGroups.get(timestamp);
      if (group) {
        group.push(e);
      } else {
        eventGroups.set(timestamp, [e]);
      }
    });

    return eventGroups;
  }

  private createDataPoints(eventGroups: Map<number, DashboardEvent[]>): any[] {
    return Array.from(eventGroups.entries()).flatMap(([timestamp, groupEvents]) => {
      return groupEvents.map((e, index) => {
        const status = getEventStatus(e);
        const jitterMs = (index - (groupEvents.length - 1) / 2) * 30000;
        const jitteredTimestamp = timestamp + jitterMs;

        return {
          name: e.message,
          value: [jitteredTimestamp, 0.5],
          status: status,
          eventType: e.type,
          severity: e.severity,
          timestamp: e.timestamp,
          itemStyle: {
            color: getStatusColorCircle(status),
          },
        };
      });
    });
  }



  private getTooltipFormatter(params: any): string {
    if (!params.data) return '';
    const timestamp = params.data.timestamp || params.data.value[0];
    const message = params.data.name || '';
    const eventType = params.data.eventType || 'Event';
    const severity = params.data.severity || 'UNKNOWN';
    const status = params.data.status || 'pending';

    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const formattedEventType = formatEventTypeWithAcronyms(eventType);
    const formattedMessage = formatMessage(message);

    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

    return `
      <div class="timeline-tooltip ${getStatusColorForTooltip(status)}">
        <div class="tooltip-header">
          ${formattedEventType}
        </div>
        ${formattedMessage ? `<div class="tooltip-message">${formattedMessage}</div>` : ''}
        <div class="tooltip-row">
          <span class="label">Status:</span>
          <span class="${getTooltipStatusColor(status)}">${statusLabel}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">Time:</span> <span class="value">${timeStr}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">Date:</span> <span class="value">${dateStr}</span>
        </div>
        <div class="tooltip-footer">
          <span class="label">Severity:</span>
          <span class="${getSeverityColor(severity)}">${severity}</span>
        </div>
      </div>
    `;
  }

}

