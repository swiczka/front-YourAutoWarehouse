import { Component, input, signal } from '@angular/core';
import { OrdersView } from '../orders-view/orders-view';
import { OrderPanel, OrderType } from '../order-panel/order-panel';

type OrdersTab = 'inbound' | 'outbound' | 'new';

// Right-hand panel of the control room: order lists and the new-order form.
@Component({
  selector: 'app-orders-panel',
  imports: [OrdersView, OrderPanel],
  templateUrl: './orders-panel.html',
  styleUrl: './orders-panel.scss',
})
export class OrdersPanel {
  readonly layoutId = input.required<number>();

  protected readonly tab = signal<OrdersTab>('inbound');
  // which form the "new order" tab opens with
  protected readonly newOrderType = signal<OrderType>('Inbound');

  protected readonly tabs: { id: OrdersTab; label: string }[] = [
    { id: 'inbound', label: 'DOSTAWY' },
    { id: 'outbound', label: 'WYDANIA' },
    { id: 'new', label: '+ NOWE ZLECENIE' },
  ];

  // "order the first one" link from an empty list
  protected startFirstOrder(type: OrderType): void {
    this.newOrderType.set(type);
    this.tab.set('new');
  }
}
