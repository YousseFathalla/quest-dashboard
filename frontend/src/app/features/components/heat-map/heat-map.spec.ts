import 'app/shared/tests/test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DashboardStore } from 'app/store/dashboard.store';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideStore } from '@ngrx/store';
import { provideEchartsCore } from 'ngx-echarts';
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

import { HeatMap } from './heat-map';

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

describe('HeatMap', () => {
  let component: HeatMap;
  let fixture: ComponentFixture<HeatMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeatMap, MatSnackBarModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore(),
        {
          provide: DashboardStore,
          useValue: {
            events: signal([]),
            loading: signal(false),
            error: signal(null),
            refresh: () => {},
          },
        },
        provideEchartsCore({ echarts }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeatMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
