import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidaySelector } from './holiday-selector';

describe('HolidaySelector', () => {
  let component: HolidaySelector;
  let fixture: ComponentFixture<HolidaySelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidaySelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidaySelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
