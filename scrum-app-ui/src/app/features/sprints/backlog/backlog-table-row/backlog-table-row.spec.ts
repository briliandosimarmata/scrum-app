import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacklogTableRow } from './backlog-table-row';

describe('BacklogTableRow', () => {
  let component: BacklogTableRow;
  let fixture: ComponentFixture<BacklogTableRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacklogTableRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BacklogTableRow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
