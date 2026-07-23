import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGridCell } from './editgridcell';

describe('Gridcell', () => {
  let component: EditGridCell;
  let fixture: ComponentFixture<EditGridCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditGridCell],
    }).compileComponents();

    fixture = TestBed.createComponent(EditGridCell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
