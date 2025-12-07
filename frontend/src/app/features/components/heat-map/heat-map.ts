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
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DashboardStore } from 'app/store/dashboard.store';
import { DASHBOARD_CONSTANTS } from '@core/constants/dashboard.constants';
import type { EChartsOption } from 'echarts';
import {
  HeatmapDetailsDialog,
  HeatmapDetailsDialogData,
} from '@features/dialogs/heatmap-details-dialog/heatmap-details-dialog';
import {
  SEVERITY_LABELS,
  generateTimeSlots,
  formatTooltip,
  processAnomalyEvents,
  TimeSlot,
  getHeatmapCellData,
} from '@shared/utilities/heat-map.utils';
import { SkeletonLoader } from '@shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-heat-map',
  imports: [NgxEchartsDirective, MatCardModule, SkeletonLoader, MatIcon, MatButton],
  templateUrl: './heat-map.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatMap {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private updateTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentTimeSlots: TimeSlot[] = [];

  readonly store = inject(DashboardStore);
  updateHeatmapOptions = signal<EChartsOption>({});

  heatmapOption = signal<EChartsOption>({
    tooltip: {
      position: 'top',
      formatter: formatTooltip,
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

  constructor() {
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
        // Generate dynamic time slots for past 24 hours
        this.currentTimeSlots = generateTimeSlots();
        const timeSlotLabels = this.currentTimeSlots.map((s) => s.label);

        // Process anomaly events using helper
        const heatmapData = processAnomalyEvents(events, this.currentTimeSlots);

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
    });
  }

  /**
   * Initializes chart event listeners.
   *
   * @param {ECharts} echartsInstance - The ECharts instance.
   */
  onChartInit(echartsInstance: ECharts): void {
    echartsInstance.on('click', (params: unknown) => {
      this.handleCellClick(params);
    });
  }

  /**
   * Handles clicks on heatmap cells.
   * Opens a dialog showing details of the anomalies in the selected time slot and severity.
   *
   * @param {unknown} params - The ECharts event parameters.
   */
  private handleCellClick(params: unknown): void {
    const result = getHeatmapCellData(params, this.currentTimeSlots, this.store.events());

    if (!result) return;

    this.dialog.open<HeatmapDetailsDialog, HeatmapDetailsDialogData>(HeatmapDetailsDialog, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        timeSlot: result.slot.label,
        eventType: 'anomaly',
        events: result.filteredEvents,
      },
    });
  }
}
