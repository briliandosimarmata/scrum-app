import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Assignee } from './assignee';

describe('Assignee', () => {
  let component: Assignee;
  let fixture: ComponentFixture<Assignee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Assignee]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Assignee);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
