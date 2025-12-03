import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatmapDetailsDialog } from './heatmap-details-dialog';

describe('HeatmapDetailsDialog', () => {
  let component: HeatmapDetailsDialog;
  let fixture: ComponentFixture<HeatmapDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeatmapDetailsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeatmapDetailsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
