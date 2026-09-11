import { Component, effect, inject, input, signal } from '@angular/core';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';
import { PackageItemServiceApi } from '../../api-services/package-item-service-api';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-order-packages',
  imports: [MatTableModule],
  templateUrl: './order-packages.html',
  styleUrl: './order-packages.scss',
})
export class OrderPackages {
  orderId = input.required<number>();

  packages = signal<PackageItemReadDto[] | null>(null);

  packageServiceApi = inject(PackageItemServiceApi);

  displayedColumns: string[] = ['ID', 'Nazwa', 'Status', 'Pozycja'];

  constructor() {
    effect(() => {
      this.fetchInboundPackages();
    });
  }

  fetchInboundPackages() {
    this.packageServiceApi.getPackagesForInboundOrder(this.orderId())
      .subscribe({
        next: (packages) => {
          this.packages.set(packages);
        },
        error: (error) => {
          console.error('Error fetching packages for inbound order:', error);
        }
      });
  }
}
