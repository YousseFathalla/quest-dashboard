import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HeatmapDetailsDialog } from './heatmap-details-dialog';

describe('HeatmapDetailsDialog', () => {
  let component: HeatmapDetailsDialog;
  let fixture: ComponentFixture<HeatmapDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeatmapDetailsDialog],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: { timeSlot: '10:00', eventType: 'completed', events: [] } }
      ]
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
