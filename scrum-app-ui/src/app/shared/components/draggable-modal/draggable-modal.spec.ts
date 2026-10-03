import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableModal } from './draggable-modal';

describe('DraggableModal', () => {
  let component: DraggableModal;
  let fixture: ComponentFixture<DraggableModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraggableModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraggableModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
