import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gridcell } from './gridcell';

describe('Gridcell', () => {
  let component: Gridcell;
  let fixture: ComponentFixture<Gridcell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gridcell],
    }).compileComponents();

    fixture = TestBed.createComponent(Gridcell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
