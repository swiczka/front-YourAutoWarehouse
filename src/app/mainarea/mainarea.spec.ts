import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mainarea } from './mainarea';

describe('Mainarea', () => {
  let component: Mainarea;
  let fixture: ComponentFixture<Mainarea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mainarea],
    }).compileComponents();

    fixture = TestBed.createComponent(Mainarea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
