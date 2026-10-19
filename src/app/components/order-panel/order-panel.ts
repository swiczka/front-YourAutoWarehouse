import { Component, computed, DestroyRef, effect, inject, input, model, signal, untracked } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { InboundOrderDto } from '../../dto/InboundOrderDto';
import { OutboundOrderDto } from '../../dto/OutboundOrderDto';
import { OrderServiceApi } from '../../api-services/order-service-api';
import { PackageItemService } from '../../services/package-item-service';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';
import { ToastService } from '../../services/toast-service';

export type OrderType = 'Inbound' | 'Outbound';

@Component({
  selector: 'app-order-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './order-panel.html',
  styleUrl: './order-panel.scss',
})
export class OrderPanel {
  // two-way bound, so the parent can open the form on a given type
  orderType = model<OrderType>('Inbound');

  orderApiService = inject(OrderServiceApi);
  packageService = inject(PackageItemService);
  private toast = inject(ToastService);
  readonly layoutId = input.required<number>();

  readonly storedPackages = this.packageService.storedPackages;

  selection = new SelectionModel<PackageItemReadDto>(true, []);
  // SelectionModel is not a signal - this mirror lets the template and the map react to it
  protected readonly selectedIds = signal<number[]>([]);
  protected readonly selectedCount = computed(() => this.selectedIds().length);

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
      this.selectedIds.set(this.selection.selected.map(pkg => pkg.id));
    });

    // ticked packages light up on the map, but only while the outbound form is open
    effect(() => {
      const ids = this.orderType() === 'Outbound' ? this.selectedIds() : [];
      this.packageService.highlightedPackageIds.set(new Set(ids));
    });
    inject(DestroyRef).onDestroy(() => this.packageService.highlightedPackageIds.set(new Set()));

    // another layout = other packages, so the old ticks must go
    effect(() => {
      this.layoutId();
      untracked(() => this.selection.clear());
    });
  }

  get inboundPackages(): FormArray<FormControl<string>> {
    return this.inboundForm.controls.packageNames;
  }

  get outboundPackages(): FormArray<FormControl<number>> {
    return this.outboundForm.controls.packageIds;
  }

  isAllSelected(): boolean {
    const numSelected = this.selectedCount();
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
            this.toast.success('DOSTAWA PRZYJĘTA', `${this.orderLabel(response)} · paczki (${dto.packageNames.length}) czekają w strefie dostaw.`);
            this.inboundForm.reset();
            this.inboundPackages.clear();
            this.selection.clear();
          },
          error: (err) => {
            console.error('Error submitting order:', err);
            this.toast.error('NIE UDAŁO SIĘ WYSŁAĆ ZLECENIA', 'Serwer nie odpowiada lub odrzucił zlecenie. Spróbuj ponownie.');
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
            this.toast.success('WYDANIE ZLECONE', `${this.orderLabel(response)} · wózki zabiorą paczki (${dto.packageIds.length}) do strefy wydań.`);
            this.outboundForm.reset();
            this.selection.clear();
          },
          error: (err) => {
            console.error('Error submitting outbound order:', err);
            this.toast.error('NIE UDAŁO SIĘ WYSŁAĆ ZLECENIA', 'Serwer nie odpowiada lub odrzucił zlecenie. Spróbuj ponownie.');
          }
        });
    }
  }

  // "Zlecenie #22" when the backend returns the new id, plain "Zlecenie" otherwise
  private orderLabel(response: unknown): string {
    const hasId = typeof response === 'object' && response !== null && 'id' in response;
    return hasId ? `Zlecenie #${(response as { id: number }).id}` : 'Zlecenie';
  }
}
