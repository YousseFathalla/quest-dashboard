import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { VolumeChart } from './volume-chart';
import '../../../../test-setup';

// Mock ECharts core
const mockEchartsCore = {
    use: () => {},
    init: () => ({
        setOption: () => {},
        resize: () => {},
        dispose: () => {},
        on: () => {},
        off: () => {},
        isDisposed: () => false
    })
};

describe('VolumeChart', () => {
  let component: VolumeChart;
  let fixture: ComponentFixture<VolumeChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolumeChart],
      providers: [
          provideEchartsCore({ echarts: mockEchartsCore })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolumeChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
