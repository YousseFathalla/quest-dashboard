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
} from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { DashboardStore } from 'app/store/dashboard.store';
import { DASHBOARD_CONSTANTS } from '@core/constants/dashboard.constants';
import { LogEvent } from '@models/dashboard.types';
import type { EChartsOption } from 'echarts';
import {
  HeatmapDetailsDialog,
  HeatmapDetailsDialogData,
} from '@features/dialogs/heatmap-details-dialog/heatmap-details-dialog';

// Severity levels 1-5 (1=low, 5=critical)
const SEVERITY_LEVELS = [1, 2, 3, 4, 5];
const SEVERITY_LABELS = ['Sev 1', 'Sev 2', 'Sev 3', 'Sev 4', 'Sev 5'];

// Severity-based colors (lighter to darker red)
const SEVERITY_COLORS: Record<number, string> = {
  1: '#fecaca', // red-200
  2: '#fca5a5', // red-300
  3: '#f87171', // red-400
  4: '#ef4444', // red-500
  5: '#dc2626', // red-600
};

@Component({
  selector: 'app-heat-map',
  imports: [
    NgxEchartsDirective,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatCardSubtitle,
  ],
  templateUrl: './heat-map.html',
  styleUrl: './heat-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatMap {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private updateTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentTimeSlots: { label: string; startTime: number; endTime: number }[] = [];

  readonly store = inject(DashboardStore);
  updateHeatmapOptions = signal<EChartsOption>({});

  heatmapOption = signal<EChartsOption>({
    tooltip: {
      position: 'top',
      formatter: (params: unknown) => {
        const p = params as { data?: { value?: [number, number, number, number, string] } };
        if (!p.data) return '';
        const dataValue = p.data.value;
        if (!dataValue) return '';
        const [, severityIndex, count, , timeSlotLabel] = dataValue;
        const severity = SEVERITY_LEVELS[severityIndex];

        return `
          <div class="p-2">
            <div class="mb-2 text-sm font-semibold text-slate-200">
              ${count} ${count === 1 ? 'Anomaly' : 'Anomalies'}
            </div>
            <div class="mb-1 text-xs text-slate-400">
              <span class="font-medium">Time:</span> ${timeSlotLabel}
            </div>
            <div class="pt-2 mt-2 text-xs border-t border-slate-700">
              <span class="font-medium text-slate-400">Severity:</span>
              <span class="ml-1 font-semibold text-red-400">Level ${severity}</span>
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
      data: [],
      splitArea: { show: true },
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'category',
      data: SEVERITY_LABELS,
      splitArea: { show: true },
      axisLabel: {
        show: true,
      },
    },
    visualMap: {
      show: false,
      min: 0,
      max: 10,
      calculable: false,
      inRange: {
        color: ['#94a3b8'],
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

  /** Generate 6 dynamic 4-hour time slots for the past 24 hours */

  private generateTimeSlots(): { label: string; startTime: number; endTime: number }[] {
    const now = new Date();
    // Align to the next hour boundary to get flat numbers (e.g. 4:20 -> 5:00)
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0);
    const endOfCurrentWindow = now.getTime();

    const slots: { label: string; startTime: number; endTime: number }[] = [];
    const slotDuration = 4 * 60 * 60 * 1000; // 4 hours in ms

    // Generate 6 slots going back 24 hours from the aligned end time
    for (let i = 5; i >= 0; i--) {
      const endTime = endOfCurrentWindow - i * slotDuration;
      const startTime = endTime - slotDuration;

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      const formatTime = (d: Date) =>
        `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

      slots.push({
        label: `${formatTime(startDate)}-${formatTime(endDate)}`,
        startTime,
        endTime,
      });
    }

    return slots;
  }


  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.updateTimeout !== null) {
        clearTimeout(this.updateTimeout);
      }
    });

    effect(
      () => {
        const events = this.store.events();

        if (this.updateTimeout !== null) {
          clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = globalThis.setTimeout(() => {
          // Generate dynamic time slots for past 24 hours
          this.currentTimeSlots = this.generateTimeSlots();
          const timeSlotLabels = this.currentTimeSlots.map((s) => s.label);

          // Only process anomaly events
          const anomalies = events.filter((e) => e.type === 'anomaly');

          const buckets = new Map<
            string,
            { count: number; severity: number; slotLabel: string }
          >();

          anomalies.forEach((e: LogEvent) => {
            // Find which time slot this event belongs to
            const slotIndex = this.currentTimeSlots.findIndex(
              (slot) => e.timestamp >= slot.startTime && e.timestamp < slot.endTime
            );

            if (slotIndex === -1) return; // Event outside 24h window

            // Get severity (default to 1 if not set)
            const severity = typeof e.severity === 'number' ? e.severity : 1;
            const severityIndex = Math.min(Math.max(severity - 1, 0), 4); // 0-4 index

            const key = `${slotIndex}-${severityIndex}`;
            const bucket = buckets.get(key) || {
              count: 0,
              severity,
              slotLabel: this.currentTimeSlots[slotIndex].label,
            };
            bucket.count++;
            buckets.set(key, bucket);
          });

          const heatmapData = Array.from(buckets.entries()).map(([key, bucket]) => {
            const [x, y] = key.split('-').map(Number);
            const severity = SEVERITY_LEVELS[y];
            return {
              value: [x, y, bucket.count, severity, bucket.slotLabel] as [
                number,
                number,
                number,
                number,
                string,
              ],
              itemStyle: {
                color: SEVERITY_COLORS[severity] || SEVERITY_COLORS[1],
              },
            };
          });

          this.updateHeatmapOptions.set({
            xAxis: { data: timeSlotLabels },
            series: [
              {
                data: heatmapData,
              },
            ],
          });
          this.updateTimeout = null;
        }, DASHBOARD_CONSTANTS.CHART_UPDATE_DEBOUNCE_MS);
      }
    );
  }

  onChartInit(echartsInstance: ECharts): void {
    echartsInstance.on('click', (params: unknown) => {
      this.handleCellClick(params);
    });
  }

  private handleCellClick(params: unknown): void {
    const p = params as { data?: { value?: [number, number, number, number, string] } };
    if (!p.data?.value) return;

    const [xIndex, yIndex] = p.data.value;
    const severity = SEVERITY_LEVELS[yIndex];

    // Use the dynamic time slots
    const slot = this.currentTimeSlots[xIndex];
    if (!slot) return;

    // Filter anomalies by time slot and severity
    const filteredEvents = this.store.events().filter((event: LogEvent) => {
      if (event.type !== 'anomaly') return false;
      const matchesTimeSlot =
        event.timestamp >= slot.startTime && event.timestamp < slot.endTime;
      const eventSeverity = typeof event.severity === 'number' ? event.severity : 1;
      const matchesSeverity = eventSeverity === severity;
      return matchesTimeSlot && matchesSeverity;
    });

    if (filteredEvents.length === 0) return;

    this.dialog.open<HeatmapDetailsDialog, HeatmapDetailsDialogData>(HeatmapDetailsDialog, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        timeSlot: slot.label,
        eventType: 'anomaly',
        events: filteredEvents,
      },
    });
  }
}
