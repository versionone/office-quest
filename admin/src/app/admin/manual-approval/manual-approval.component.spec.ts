import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualApprovalComponent } from './manual-approval.component';

describe('ManualApprovalComponent', () => {
  let component: ManualApprovalComponent;
  let fixture: ComponentFixture<ManualApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
