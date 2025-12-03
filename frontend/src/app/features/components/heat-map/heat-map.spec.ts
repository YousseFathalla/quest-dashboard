import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatMap } from './heat-map';

describe('HeatMap', () => {
  let component: HeatMap;
  let fixture: ComponentFixture<HeatMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeatMap]
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
