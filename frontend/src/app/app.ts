import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { DashboardStore } from './core/store/dashboard.store';
import { DatePipe } from '@angular/common';
import type { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
// import echarts core
import * as echarts from 'echarts/core';
// import necessary echarts components
import { BarChart, ScatterChart, HeatmapChart, LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([
  BarChart,
  ScatterChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
  LineChart,
  LegendComponent
]);
@Component({
  selector: 'app-root',
  imports: [DatePipe, NgxEchartsDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [provideEchartsCore({ echarts })],
})
export class App implements OnInit {
  readonly store = inject(DashboardStore);
  readonly timeRanges: ('6h' | '12h' | '24h')[] = ['6h', '12h', '24h'];
  updateHeatmapOptions = signal<EChartsOption>({});
  updateOptions = signal<EChartsOption>({});
  updateVolumeOption = signal<EChartsOption>({});
  // 1. Initial Chart Configuration (The Static "Look")
  chartOption = signal<EChartsOption>({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    grid: { left: '5%', right: '5%', bottom: '10%', top: '10%' },
    xAxis: {
      type: 'time',
      splitLine: { show: false },
      axisLabel: { color: '#94a3b8' }, // Slate-400
      axisLine: { lineStyle: { color: '#475569' } },
    },
    yAxis: {
      type: 'category',
      data: ['SLA_BREACH', 'CASE_DELAY', 'WORKFLOW_COMPLETE', 'NEW_CASE'], // The categories
      splitLine: { show: true, lineStyle: { color: '#334155', type: 'dashed' } }, // Slate-700
      axisLabel: { color: '#cbd5e1' }, // Slate-300
    },
    series: [
      {
        type: 'scatter',
        symbolSize: 20, // Big dots
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.5)',
        },
        data: [], // Starts empty
      },
    ],
  });

  // 2. The Dynamic Updates

  heatmapOption = signal<EChartsOption>({
    tooltip: { position: 'top' },
    grid: { height: '50%', top: '10%' },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'], // Simplified time buckets
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      data: ['INFO', 'WARNING', 'CRITICAL'],
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: 10, // If we have >10 errors, it's max red
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      inRange: {
        color: ['#1e293b', '#3b82f6', '#eab308', '#ef4444'], // Dark -> Blue -> Yellow -> Red
      },
    },
    series: [
      {
        name: 'Anomalies',
        type: 'heatmap',
        data: [], // Will be filled dynamically
        label: { show: true },
      },
    ],
  });
  volumeOption = signal<EChartsOption>({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Total Volume', 'Critical Errors'], textStyle: { color: '#94a3b8' }, bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: [], // Will be filled dynamically (e.g., "10:00", "11:00")
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: [
      { type: 'value', name: 'Volume', position: 'left', splitLine: { show: false } },
      { type: 'value', name: 'Errors', position: 'right', splitLine: { show: false } }
    ],
    series: [
      { name: 'Total Volume', type: 'bar', data: [], itemStyle: { color: '#3b82f6' } }, // Blue Bars
      { name: 'Critical Errors', type: 'line', yAxisIndex: 1, data: [], itemStyle: { color: '#ef4444' }, smooth: true } // Red Line
    ]
  });
  constructor() {
    // 3. The Magic: Connect SignalStore -> Chart
    effect(() => {
      const events = this.store.events();

      // Transform our Events into ECharts Data Points [Time, Category, Severity]
      const dataPoints = events.map((e) => ({
        name: e.message,
        value: [
          e.timestamp, // X Axis (Time)
          e.type, // Y Axis (Category)
          e.severity, // Extra info for color
        ],
        itemStyle: {
          color: this.getColor(e.severity),
        },
      }));

      // Update ONLY the series data (High Performance)
      this.updateOptions.set({
        series: [
          {
            data: dataPoints,
          },
        ],
      });
    });
    // Effect 2: Update Heatmap
    effect(() => {
      const events = this.store.events();

      // 1. Create a 3x7 grid (Severity x Time) filled with zeros
      // Format: [xIndex, yIndex, count]
      // yIndex: 0=INFO, 1=WARNING, 2=CRITICAL
      const buckets = new Map<string, number>();

      events.forEach((e) => {
        // Simplify time to 4-hour blocks for demo (0, 1, 2, 3, 4, 5)
        const hour = new Date(e.timestamp).getHours();
        const timeIndex = Math.floor(hour / 4);

        let severityIndex = 0;
        if (e.severity === 'WARNING') severityIndex = 1;
        if (e.severity === 'CRITICAL') severityIndex = 2;

        const key = `${timeIndex}-${severityIndex}`;
        buckets.set(key, (buckets.get(key) || 0) + 1);
      });

      // 2. Convert Map to ECharts Data Format
      const heatmapData = Array.from(buckets.entries()).map(([key, count]) => {
        const [x, y] = key.split('-').map(Number);
        return [x, y, count];
      });

      // 3. Update the chart
      this.updateHeatmapOptions.set({
        series: [
          {
            data: heatmapData,
          },
        ],
      });
    });
    // Effect 3: Update Volume
    effect(() => {
      // Note: We use 'filteredEvents' from the store to respect the 6h/12h/24h filter!
      const events = this.store.filteredEvents();

      // Group by Hour (Simple aggregation)
      const volumeMap = new Map<string, { total: number, critical: number }>();

      events.forEach(e => {
          const hourLabel = new Date(e.timestamp).getHours() + ':00';
          const current = volumeMap.get(hourLabel) || { total: 0, critical: 0 };

          current.total++;
          if (e.severity === 'CRITICAL') current.critical++;

          volumeMap.set(hourLabel, current);
      });

      // Sort by time (so the chart reads left-to-right)
      const sortedHours = Array.from(volumeMap.keys()).sort();

      this.updateVolumeOption.set({
          xAxis: { data: sortedHours },
          series: [
              { data: sortedHours.map(h => volumeMap.get(h)?.total || 0) },
              { data: sortedHours.map(h => volumeMap.get(h)?.critical || 0) }
          ]
      });
    });
  }

  ngOnInit() {
    this.store.connect();
  }

  // Helper for colors
  private getColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return '#ef4444'; // Red-500
      case 'WARNING':
        return '#eab308'; // Yellow-500
      case 'INFO':
        return '#3b82f6'; // Blue-500
      default:
        return '#94a3b8';
    }
  }
}
