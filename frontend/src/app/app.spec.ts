import { TestBed } from '@angular/core/testing';
import { provideEchartsCore } from 'ngx-echarts';
import { App } from './app';
import '../test-setup';

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

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
          provideEchartsCore({ echarts: mockEchartsCore })
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
