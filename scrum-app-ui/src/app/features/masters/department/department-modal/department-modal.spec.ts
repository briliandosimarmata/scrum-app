import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentModal } from './department-modal';

describe('DepartmentModal', () => {
  let component: DepartmentModal;
  let fixture: ComponentFixture<DepartmentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
