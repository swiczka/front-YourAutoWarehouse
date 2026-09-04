import { Component, inject, input, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { InboundOrderDto } from '../../dto/InboundOrderDto';
import { OrderServiceApi } from '../../api-services/order-service-api';

export type OrderType = 'Inbound' | 'Outbound';

@Component({
  selector: 'app-order-panel',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatButtonModule,
  ],
  templateUrl: './order-panel.html',
  styleUrl: './order-panel.scss',
})
export class OrderPanel {
  orderType = signal<OrderType>('Inbound');

  orderApiService = inject(OrderServiceApi);
  readonly layoutId = input.required<number>();

  inboundForm = new FormGroup({
    companyId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    packages: new FormArray<FormControl<string>>([]),
  });

  outboundForm = new FormGroup({
    companyId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    packages: new FormArray<FormControl<string>>([]),
  });

  get inboundPackages(): FormArray<FormControl<string>> {
    return this.inboundForm.controls.packages;
  }

  get outboundPackages(): FormArray<FormControl<string>> {
    return this.outboundForm.controls.packages;
  }

  addInboundPackage(): void {
    this.inboundPackages.push(new FormControl('Paczka '+this.inboundPackages.length, { nonNullable: true }));
  }

  removeInboundPackage(index: number): void {
    this.inboundPackages.removeAt(index);
  }

  addOutboundPackage(): void {
    this.outboundPackages.push(new FormControl('', { nonNullable: true }));
  }

  removeOutboundPackage(index: number): void {
    this.outboundPackages.removeAt(index);
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
          },
          error: (err) => {
            console.error('Error submitting order:', err);
          }
        });
  }
  }

  submitOutbound(): void {
    console.info('Outbound submit:', this.outboundForm.value);
  }
}
