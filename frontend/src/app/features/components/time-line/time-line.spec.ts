import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeLine } from './time-line';

describe('TimeLine', () => {
  let component: TimeLine;
  let fixture: ComponentFixture<TimeLine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeLine]
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
