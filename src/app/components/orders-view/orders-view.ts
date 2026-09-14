import { Component, effect, inject, input, signal } from '@angular/core';
import { OrderServiceApi } from '../../api-services/order-service-api';
import { InboundOrderReadDto } from '../../dto/InboundOrderReadDto';
import { DatePipe } from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import { OrderPackages } from '../order-packages/order-packages';
import { OutboundOrderReadDto } from '../../dto/OutboundOrderReadDto';

@Component({
  selector: 'app-orders-view',
  imports: [DatePipe, MatTableModule, OrderPackages],
  templateUrl: './orders-view.html',
  styleUrl: './orders-view.scss',
})
export class OrdersView {
  orderServiceApi = inject(OrderServiceApi);
  
  inboundOrders = signal<InboundOrderReadDto[]>([]);
  outboundOrders = signal<OutboundOrderReadDto[]>([]);

  layoutId = input.required<number>();
  orderType = input<string>("inbound");

  displayedColumns: string[] = ['ID', 'ID Firmy', 'Utworzono', 'Status'];

  clickedOrder = signal<InboundOrderReadDto | OutboundOrderReadDto | null>(null);

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
      },
      error: (error) => {
        console.error('Error fetching outbound orders:', error);
      }
    });
  }
}
