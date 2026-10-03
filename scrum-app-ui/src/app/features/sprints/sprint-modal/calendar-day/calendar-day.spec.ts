import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarDay } from './calendar-day';

describe('CalendarDay', () => {
  let component: CalendarDay;
  let fixture: ComponentFixture<CalendarDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarDay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarDay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
