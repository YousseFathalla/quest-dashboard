import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { TimeLine } from './time-line';
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

describe('TimeLine', () => {
  let component: TimeLine;
  let fixture: ComponentFixture<TimeLine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeLine],
      providers: [
          provideEchartsCore({ echarts: mockEchartsCore })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeLine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
