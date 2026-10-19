import { Component, inject, input, output } from '@angular/core';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';
import { PanelPopup } from '../ui/panel-popup/panel-popup';
import { PackageItemService } from '../../services/package-item-service';
import { getStatusView } from '../../helpers/status.helpers';

@Component({
  selector: 'app-delivery-zone',
  imports: [PanelPopup],
  templateUrl: './delivery-zone.html',
  styleUrl: './delivery-zone.scss',
  host: {
    '[class.is-open]': 'open()',
  },
})
export class DeliveryZone {
  private packageService = inject(PackageItemService);

  packages = input.required<PackageItemReadDto[]>();
  // the parent keeps only one map popup open at a time
  open = input(false);
  toggle = output<void>();

  protected readonly statusView = getStatusView;

  protected target(packageId: number): string {
    const target = this.packageService.getAllocationTarget(packageId);
    return target ? `(${target.x}, ${target.y})` : '—';
  }
}
