import { Component, inject, input, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { InboundOrderDto } from '../../dto/InboundOrderDto';
import { OutboundOrderDto } from '../../dto/OutboundOrderDto';
import { OrderServiceApi } from '../../api-services/order-service-api';
import { PackageItemService } from '../../services/package-item-service';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';

export type OrderType = 'Inbound' | 'Outbound';

@Component({
  selector: 'app-order-panel',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule
  ],
  templateUrl: './order-panel.html',
  styleUrl: './order-panel.scss',
})
export class OrderPanel {
  orderType = signal<OrderType>('Inbound');

  orderApiService = inject(OrderServiceApi);
  packageService = inject(PackageItemService);
  readonly layoutId = input.required<number>();

  readonly storedPackages = this.packageService.storedPackages;
  readonly displayedColumns: string[] = ['select', 'id', 'name', 'coords', 'inboundId'];

  selection = new SelectionModel<PackageItemReadDto>(true, []);

  inboundForm = new FormGroup({
    companyId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    packageNames: new FormArray<FormControl<string>>([]),
  });

  outboundForm = new FormGroup({
    companyId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    packageIds: new FormArray<FormControl<number>>([]),
  });

  constructor() {
    this.selection.changed.subscribe(() => {
      const packageIdsControl = this.outboundForm.controls.packageIds;
      packageIdsControl.clear();
      for (const pkg of this.selection.selected) {
        packageIdsControl.push(new FormControl(pkg.id, { nonNullable: true }));
      }
    });
  }

  get inboundPackages(): FormArray<FormControl<string>> {
    return this.inboundForm.controls.packageNames;
  }

  get outboundPackages(): FormArray<FormControl<number>> {
    return this.outboundForm.controls.packageIds;
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.storedPackages().length;
    return numSelected === numRows && numRows > 0;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.storedPackages());
  }

  addInboundPackage(): void {
    this.inboundPackages.push(new FormControl('Paczka ' + this.inboundPackages.length, { nonNullable: true }));
  }

  removeInboundPackage(index: number): void {
    this.inboundPackages.removeAt(index);
  }

  submitInbound(): void {
    if (this.inboundForm.valid) {
      const dto: InboundOrderDto = {
        ...this.inboundForm.getRawValue(),
        layoutId: this.layoutId()
      };
      console.log(dto);

      this.orderApiService.postInboundOrder(dto)
        .subscribe({
          next: (response) => {
            console.log('Order submitted successfully!', response);
            this.inboundForm.reset();
            this.selection.clear();
          },
          error: (err) => {
            console.error('Error submitting order:', err);
          }
        });
    }
  }

  submitOutbound(): void {
    if (this.outboundForm.valid && this.outboundPackages.length > 0) {
      const dto: OutboundOrderDto = {
        companyId: this.outboundForm.controls.companyId.value,
        packageIds: this.outboundForm.controls.packageIds.getRawValue(),
        layoutId: this.layoutId()
      };
      console.log('Submitting outbound order:', dto);

      this.orderApiService.postOutboundOrder(dto)
        .subscribe({
          next: (response) => {
            console.log('Outbound order submitted successfully!', response);
            this.outboundForm.reset();
            this.selection.clear();
          },
          error: (err) => {
            console.error('Error submitting outbound order:', err);
          }
        });
    }
  }
}
