import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPanel } from './order-panel';

describe('OrderPanel', () => {
  let component: OrderPanel;
  let fixture: ComponentFixture<OrderPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderPanel);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('layoutId', 1);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
