import { Component, effect, inject, input, signal } from '@angular/core';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';
import { PackageItemServiceApi } from '../../api-services/package-item-service-api';
import { getStatusView } from '../../helpers/status.helpers';

@Component({
  selector: 'app-order-packages',
  imports: [],
  templateUrl: './order-packages.html',
  styleUrl: './order-packages.scss',
})
export class OrderPackages {
  orderId = input.required<number>();
  orderType = input.required<"inbound" | "outbound">();

  packages = signal<PackageItemReadDto[] | null>(null);

  packageServiceApi = inject(PackageItemServiceApi);

  protected readonly statusView = getStatusView;

  constructor() {
    effect(() => {
      this.fetchPackages();
    });
  }

  fetchPackages() {
    if(this.orderType() === "inbound"){
      this.packageServiceApi.getPackagesForInboundOrder(this.orderId())
        .subscribe({
          next: (packages) => {
            this.packages.set(packages);
          },
          error: (error) => {
            console.error('Error fetching packages for inbound order:', error);
          }
        });
    } else if(this.orderType() === "outbound"){
      this.packageServiceApi.getPackagesForOutboundOrder(this.orderId())
        .subscribe({
          next: (packages) => {
            this.packages.set(packages);
          },
          error: (error) => {
            console.error('Error fetching packages for outbound order:', error);
          }
        });
    }
    
  }
}
