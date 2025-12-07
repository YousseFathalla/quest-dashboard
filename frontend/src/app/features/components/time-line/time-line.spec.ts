import 'app/shared/tests/test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideEchartsCore, NgxEchartsDirective } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, HeatmapChart, LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { signal, Directive, input } from '@angular/core';

import { TimeLine } from './time-line';
import { DashboardStore } from 'app/store/dashboard.store';
import { LogEvent } from 'app/models/dashboard.types';

echarts.use([
  BarChart,
  LineChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
  CanvasRenderer,
]);

@Directive({ selector: '[echarts]' })
class MockNgxEchartsDirective {
  options = input<any>();
}

describe('TimeLine (Logic & Aggregation)', () => {
  let component: TimeLine;
  let fixture: ComponentFixture<TimeLine>;
  let mockStore: any;
  let visibleEventsSignal: any;

  // Fixed "Now": 2025-10-10 10:30:00
  const FIXED_TIME = new Date('2025-10-10T10:30:00');

  beforeEach(async () => {
    // Create a writable signal node for the mock store
    visibleEventsSignal = signal<LogEvent[]>([]);

    mockStore = {
      visibleEvents: visibleEventsSignal,
      loading: signal(false),
      filter: signal('all'),
      setFilter: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TimeLine, MatSnackBarModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // Mock the DashboardSignalStore
        { provide: DashboardStore, useValue: mockStore },
        provideEchartsCore({ echarts }),
      ],
    })
      .overrideComponent(TimeLine, {
        remove: { imports: [NgxEchartsDirective] },
        add: { imports: [MockNgxEchartsDirective] },
      })
      .compileComponents();

    // Lock system time to ensure deterministic chart buckets
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TIME);

    fixture = TestBed.createComponent(TimeLine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly aggregate events into their respective hourly buckets', () => {
    // SCENARIO:
    // Current Time: 10:30
    // Buckets should range from [Yesterday 11:00] to [Today 10:00]

    const events: LogEvent[] = [
      // 1. Event in current hour (10:15) -> Should be in the LAST bucket (Index 23)
      {
        id: '1',
        type: 'completed',
        timestamp: new Date('2025-10-10T10:15:00').getTime(),
      },

      // 2. Event 1 hour ago (09:55) -> Should be in bucket Index 22 (09:00 slot)
      {
        id: '2',
        type: 'pending',
        timestamp: new Date('2025-10-10T09:55:00').getTime(),
      },

      // 3. Event 2 hours ago (08:30) -> Should be in bucket Index 21 (08:00 slot)
      {
        id: '3',
        type: 'anomaly',
        timestamp: new Date('2025-10-10T08:30:00').getTime(),
      },

      // 4. Old event (25 hours ago) -> Should be ignored (filtered out of view)
      {
        id: '4',
        type: 'completed',
        timestamp: new Date('2025-10-09T09:00:00').getTime(),
      },
    ];

    // Simulate store update
    visibleEventsSignal.set(events);
    fixture.detectChanges();

    // Access computed chart options
    const options = component.chartOption();
    const series = options.series as any[];
    const categories = (options.yAxis as any).data;

    // --- Validation 1: Time Labels ---
    // The last category should be the current hour "10:00"
    expect(categories[categories.length - 1]).toBe('10:00');
    // The previous one should be "09:00"
    expect(categories[categories.length - 2]).toBe('09:00');

    // --- Validation 2: Data Counts ---
    // Series Order: [0]: Completed, [1]: Pending, [2]: Anomalies

    // Check Current Hour (10:00) - Expect 1 Completed
    expect(series[0].data[23]).toBe(1); // Completed
    expect(series[1].data[23]).toBe(0); // Pending
    expect(series[2].data[23]).toBe(0); // Anomaly

    // Check Previous Hour (09:00) - Expect 1 Pending
    expect(series[0].data[22]).toBe(0);
    expect(series[1].data[22]).toBe(1);
    expect(series[2].data[22]).toBe(0);

    // Check 2 Hours Ago (08:00) - Expect 1 Anomaly
    expect(series[2].data[21]).toBe(1); // Anomaly
  });
});
