import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Forklift } from './forklift';

describe('Forklift', () => {
  let component: Forklift;
  let fixture: ComponentFixture<Forklift>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Forklift],
    }).compileComponents();

    fixture = TestBed.createComponent(Forklift);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
