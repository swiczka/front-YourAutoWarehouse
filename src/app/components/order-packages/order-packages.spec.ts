import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPackages } from './order-packages';

describe('OrderPackages', () => {
  let component: OrderPackages;
  let fixture: ComponentFixture<OrderPackages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPackages],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderPackages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
