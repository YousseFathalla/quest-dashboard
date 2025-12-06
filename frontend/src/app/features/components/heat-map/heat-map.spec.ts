import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { HeatMap } from './heat-map';
import '../../../../test-setup';

// Mock ECharts core
const mockEchartsCore = {
    use: () => {},
    init: () => ({
        setOption: () => {},
        resize: () => {},
        dispose: () => {},
        on: () => {}, // Mock 'on' method
        off: () => {}, // Mock 'off' method
        isDisposed: () => false // Mock 'isDisposed' method
    })
};

describe('HeatMap', () => {
  let component: HeatMap;
  let fixture: ComponentFixture<HeatMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeatMap],
      providers: [
          provideEchartsCore({ echarts: mockEchartsCore })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeatMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
