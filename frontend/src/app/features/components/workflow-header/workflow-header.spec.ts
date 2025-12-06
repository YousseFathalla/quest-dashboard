import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowHeader } from './workflow-header';

describe('WorkflowHeader', () => {
  let component: WorkflowHeader;
  let fixture: ComponentFixture<WorkflowHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
