import { Component, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core';
import { OrderServiceApi } from '../../api-services/order-service-api';
import { InboundOrderReadDto } from '../../dto/InboundOrderReadDto';
import { DatePipe } from '@angular/common';
import { OrderPackages } from '../order-packages/order-packages';
import { OutboundOrderReadDto } from '../../dto/OutboundOrderReadDto';
import { getStatusView } from '../../helpers/status.helpers';

@Component({
  selector: 'app-orders-view',
  imports: [DatePipe, OrderPackages],
  templateUrl: './orders-view.html',
  styleUrl: './orders-view.scss',
})
export class OrdersView {
  orderServiceApi = inject(OrderServiceApi);

  inboundOrders = signal<InboundOrderReadDto[]>([]);
  outboundOrders = signal<OutboundOrderReadDto[]>([]);
  // false until the first response, so an empty list is not shown while loading
  loaded = signal(false);

  layoutId = input.required<number>();
  orderType = input<string>("inbound");
  // "order the first one" button in the empty state
  orderFirst = output<void>();

  // forgets the selected order when another layout is opened
  clickedOrder = linkedSignal<number, InboundOrderReadDto | OutboundOrderReadDto | null>({
    source: this.layoutId,
    computation: () => null
  });

  protected readonly orders = computed<(InboundOrderReadDto | OutboundOrderReadDto)[]>(() =>
    this.orderType() === 'outbound' ? this.outboundOrders() : this.inboundOrders()
  );
  protected readonly statusView = getStatusView;

  constructor(){
    effect(() => {
      this.getLayoutInboundOrders();
      this.getLayoutOutboundOrders();
    });
  }


  getLayoutInboundOrders(){
    this.orderServiceApi.getInboundOrders(this.layoutId()).subscribe({
      next: (orders) => {
        this.inboundOrders.set(orders);
        this.loaded.set(true);
      },
      error: (error) => {
        console.error('Error fetching inbound orders:', error);
      }
    });
  }

    getLayoutOutboundOrders(){
    this.orderServiceApi.getOutboundOrders(this.layoutId()).subscribe({
      next: (orders) => {
        this.outboundOrders.set(orders);
        this.loaded.set(true);
      },
      error: (error) => {
        console.error('Error fetching outbound orders:', error);
      }
    });
  }
}
