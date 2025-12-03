import {
  Component,
  effect,
  inject,
  signal,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { ECharts } from 'echarts/core';
import {
  MatCard,
  MatCardHeader,
  MatCardContent,
  MatCardTitle,
  MatCardSubtitle,
  MatCardActions,
} from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DashboardStore } from '@core/store/dashboard.store';
import { DASHBOARD_CONSTANTS } from '@core/constants/dashboard.constants';
import { EventSeverity, DashboardEvent } from '@core/models/dashboard.types';
import { getEventStatus, getStatusColorCircle, getTooltipStatusColor } from '@core/utils/event-status.utils';
import type { EChartsOption } from 'echarts';
import {
  HeatmapDetailsDialog,
  HeatmapDetailsDialogData,
} from '@features/dialogs/heatmap-details-dialog/heatmap-details-dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-heat-map',
  imports: [
    NgxEchartsDirective,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatSlideToggleModule,
    FormsModule,
    MatCardTitle,
    MatCardSubtitle,
    MatCardActions,
    MatCheckboxModule,
  ],
  templateUrl: './heat-map.html',
  styleUrl: './heat-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatMap {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private updateTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly store = inject(DashboardStore);
  updateHeatmapOptions = signal<EChartsOption>({});
  showCriticalOnly = signal<boolean>(false);
  heatmapOption = signal<EChartsOption>({
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        if (!params.data) return '';
        const dataValue = params.data.value || params.data;
        const [xIndex, , count, statusType] = Array.isArray(dataValue)
          ? dataValue
          : [dataValue[0], dataValue[1], dataValue[2], dataValue[3]];
        const timeSlots = [
          '00:00-04:00',
          '04:00-08:00',
          '08:00-12:00',
          '12:00-16:00',
          '16:00-20:00',
          '20:00-24:00',
        ];
        const statusLabels: Record<string, string> = {
          completed: 'Completed',
          pending: 'Pending',
          anomaly: 'Critical',
        };

        const timeSlot = timeSlots[xIndex] || 'Unknown';
        const statusTypeLabel = statusLabels[statusType] || 'Unknown';

        return `
          <div class="p-2">
            <div class="font-semibold text-sm mb-2 text-slate-200">
              ${count} ${count === 1 ? 'Event' : 'Events'}
            </div>
            <div class="text-xs text-slate-400 mb-1">
              <span class="font-medium">Time:</span> ${timeSlot}
            </div>
            <div class="text-xs mt-2 pt-2 border-t border-slate-700">
              <span class="font-medium text-slate-400">Status:</span>
              <span class="${getTooltipStatusColor(statusType)} font-semibold ml-1">${statusTypeLabel}</span>
            </div>
          </div>
        `;
      },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: {
        color: '#e2e8f0',
      },
    },
    grid: {
      left: '1%',
      right: '4%',
      top: '7%',
      bottom: '6%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      data: ['Pending', 'Completed', 'Critical'],
      splitArea: { show: true },
      axisLabel: {
        show: true,
      },
    },
    visualMap: {
      show: false, // Hide visualMap since we're using custom colors via itemStyle
      min: 0,
      max: 10,
      calculable: false,
      inRange: {
        color: ['#94a3b8'], // Dummy color, will be overridden by itemStyle
      },
    },
    series: [
      {
        name: 'Anomalies',
        type: 'heatmap',
        data: [],
        label: { show: true },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    ],
    media: [
      {
        query: { maxWidth: 768 },
        option: {
          yAxis: {
            axisLabel: {
              show: false,
            },
          },
          grid: {
            left: '3%',
          },
        },
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
      const events = this.store.events();

      // Debounce chart updates for performance
      if (this.updateTimeout !== null) {
        clearTimeout(this.updateTimeout);
      }

      this.updateTimeout = globalThis.setTimeout(() => {
        // Bucket key: "timeIndex-severityIndex" -> { count, eventTypes: Set }
        const buckets = new Map<string, { count: number; eventTypes: Set<string> }>();

        const criticalOnly = this.showCriticalOnly();

        events.forEach((e) => {
          const status = getEventStatus(e);
          if (criticalOnly && status !== 'anomaly') {
            return;
          }

          const hour = new Date(e.timestamp).getHours();
          const timeIndex = Math.floor(hour / 4);

          // Map status to Y-axis index: pending=0, completed=1, anomaly/critical=2
          let statusIndex = 0; // Pending
          if (status === 'completed') statusIndex = 1;
          if (status === 'anomaly') statusIndex = 2;

          const key = `${timeIndex}-${statusIndex}`;
          const bucket = buckets.get(key) || { count: 0, eventTypes: new Set<string>() };
          bucket.count++;
          bucket.eventTypes.add(e.type);
          buckets.set(key, bucket);
        });

        // Determine status and color for each bucket based on events
        // Use the first event in the bucket to determine status (or check all events)
        // Priority: Anomaly (red) > Completed (green) > Pending (yellow)
        const getStatusFromEvents = (
          events: DashboardEvent[]
        ): { status: string; color: string } => {
          // Check all events in the bucket - if any is an anomaly, mark as anomaly
          // If any is completed and none are anomalies, mark as completed
          // Otherwise, mark as pending
          let hasAnomaly = false;
          let hasCompleted = false;

          events.forEach((event) => {
            const status = getEventStatus(event);
            if (status === 'anomaly') hasAnomaly = true;
            if (status === 'completed') hasCompleted = true;
          });

          if (hasAnomaly) {
            return { status: 'anomaly', color: getStatusColorCircle('anomaly') };
          }
          if (hasCompleted) {
            return { status: 'completed', color: getStatusColorCircle('completed') };
          }
          return { status: 'pending', color: getStatusColorCircle('pending') };
        };

        // Create a map of events by bucket key for status determination
        const eventsByBucket = new Map<string, DashboardEvent[]>();
        events.forEach((e) => {
          const status = getEventStatus(e);
          if (criticalOnly && status !== 'anomaly') {
            return;
          }

          const hour = new Date(e.timestamp).getHours();
          const timeIndex = Math.floor(hour / 4);

          // Map status to Y-axis index: pending=0, completed=1, anomaly/critical=2
          let statusIndex = 0; // Pending
          if (status === 'completed') statusIndex = 1;
          if (status === 'anomaly') statusIndex = 2;

          const key = `${timeIndex}-${statusIndex}`;
          const bucketEvents = eventsByBucket.get(key) || [];
          bucketEvents.push(e);
          eventsByBucket.set(key, bucketEvents);
        });

        const heatmapData = Array.from(buckets.entries()).map(([key, bucket]) => {
          const [x, y] = key.split('-').map(Number);
          const bucketEvents = eventsByBucket.get(key) || [];
          const { status, color } = getStatusFromEvents(bucketEvents);

          return {
            value: [x, y, bucket.count, status],
            itemStyle: {
              color: color,
            },
          };
        });

        this.updateHeatmapOptions.set({
          series: [
            {
              data: heatmapData,
            },
          ],
        });
        this.updateTimeout = null;
      }, DASHBOARD_CONSTANTS.CHART_UPDATE_DEBOUNCE_MS);
    });
  }

  onChartInit(echartsInstance: ECharts): void {
    // Setup click handler when chart is initialized
    echartsInstance.on('click', (params: any) => {
      this.handleCellClick(params);
    });
  }

  private handleCellClick(params: any): void {
    if (!params.data) return;

    const dataValue = params.data.value || params.data;
    const [xIndex, yIndex] = Array.isArray(dataValue) ? dataValue : [dataValue[0], dataValue[1]];

    const timeSlots = [
      '00:00-04:00',
      '04:00-08:00',
      '08:00-12:00',
      '12:00-16:00',
      '16:00-20:00',
      '20:00-24:00',
    ];
    const statuses: Array<'pending' | 'completed' | 'anomaly'> = ['pending', 'completed', 'anomaly'];
    const statusLabels = ['Pending', 'Completed', 'Critical'];

    const timeSlot = timeSlots[xIndex] || 'Unknown';
    const status = statuses[yIndex] || 'pending';
    const statusLabel = statusLabels[yIndex] || 'Pending';

    // Filter events for this time slot and status
    const [startHour, endHour] = timeSlot.split('-').map((time: string) => {
      const [hour] = time.split(':').map(Number);
      return hour;
    });

    const filteredEvents = this.store.events().filter((event) => {
      const eventHour = new Date(event.timestamp).getHours();
      const matchesTimeSlot = eventHour >= startHour && eventHour < (endHour || 24);
      const eventStatus = getEventStatus(event);
      const matchesStatus = eventStatus === status;
      return matchesTimeSlot && matchesStatus;
    });

    // Open dialog with filtered events
    // Map status to severity for dialog compatibility (Critical maps to CRITICAL)
    const severityMap: Record<string, EventSeverity> = {
      'Pending': 'INFO',
      'Completed': 'INFO',
      'Critical': 'CRITICAL',
    };

    this.dialog.open<HeatmapDetailsDialog, HeatmapDetailsDialogData>(HeatmapDetailsDialog, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        timeSlot,
        severity: severityMap[statusLabel] || 'INFO',
        events: filteredEvents,
      },
    });
  }
}
