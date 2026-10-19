import { Component, computed, inject, linkedSignal } from '@angular/core';
import { GRID_CONFIG } from '../../config/grid.config';
import { GridService } from '../../services/grid-service';
import { ForkliftService } from '../../services/forklift-service';
import { PackageItemService } from '../../services/package-item-service';
import { LayoutStateService } from '../../services/layout-state-service';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';
import { Gridcell } from '../../mainarea/gridcell/gridcell';
import { Forklift } from '../forklift/forklift';
import { PackagePopup } from '../package-popup/package-popup';
import { DeliveryZone } from '../delivery-zone/delivery-zone';
import { SendingZone } from '../sending-zone/sending-zone';
import { GarageZone } from '../garage-zone/garage-zone';

// Only one popup can be open on the map at a time.
type MapPopup =
  | { kind: 'package'; package: PackageItemReadDto }
  | { kind: 'forklift'; forkliftId: number }
  | { kind: 'delivery' }
  | { kind: 'sending' }
  | { kind: 'garage' };

// Live view of a saved layout: cells, moving forklifts, zones and their popups.
@Component({
  selector: 'app-warehouse-map',
  imports: [Gridcell, Forklift, PackagePopup, DeliveryZone, SendingZone, GarageZone],
  templateUrl: './warehouse-map.html',
  styleUrl: './warehouse-map.scss',
})
export class WarehouseMap {
  private gridService = inject(GridService);
  private forkliftService = inject(ForkliftService);
  private packageService = inject(PackageItemService);
  private layoutState = inject(LayoutStateService);

  protected readonly cells = computed(() => [...this.gridService.cells().values()]);
  protected readonly widthPx = computed(() => this.gridService.sizeX() * GRID_CONFIG.gridCellSizePx);
  protected readonly heightPx = computed(() => this.gridService.sizeY() * GRID_CONFIG.gridCellSizePx);

  protected readonly allocatedPackages = this.packageService.allocatedPackages;
  protected readonly sentPackages = this.packageService.sentPackages;
  protected readonly carriedByForklift = this.packageService.carriedByForklift;
  protected readonly highlightedPackageIds = this.packageService.highlightedPackageIds;

  // forklifts standing on (0, 0) are parked in the garage and not drawn on the map
  protected readonly movingForklifts = computed(() =>
    [...this.forkliftService.forklifts().values()].filter(forklift => !(forklift.x === 0 && forklift.y === 0))
  );

  // forklift ids are 1..forkliftNumber; every one that is not driving is in the garage
  protected readonly garageForkliftIds = computed(() => {
    const moving = new Set(this.movingForklifts().map(forklift => forklift.id));
    const ids: number[] = [];
    for (let id = 1; id <= this.layoutState.forkliftNumber(); id++) {
      if (!moving.has(id)) {
        ids.push(id);
      }
    }
    return ids;
  });

  // closes whatever is open when another layout is loaded
  protected readonly openPopup = linkedSignal<number | null, MapPopup | null>({
    source: this.layoutState.layoutId,
    computation: () => null
  });

  protected readonly selectedPackageId = computed(() => {
    const popup = this.openPopup();
    return popup?.kind === 'package' ? popup.package.id : null;
  });

  protected readonly selectedForkliftId = computed(() => {
    const popup = this.openPopup();
    return popup?.kind === 'forklift' ? popup.forkliftId : null;
  });

  protected readonly openPackage = computed(() => {
    const popup = this.openPopup();
    return popup?.kind === 'package' ? popup.package : null;
  });

  protected getPackageByCoord(x: number, y: number): PackageItemReadDto | null {
    return this.packageService.getByCoords(x, y);
  }

  // where the package on the forks is going: its shelf, or the dispatch zone
  protected destinationOf(forkliftId: number): string | null {
    const carried = this.carriedByForklift().get(forkliftId);
    if (!carried) {
      return null;
    }
    if (carried.outboundOrderId) {
      return 'strefa wydań';
    }
    const target = this.packageService.getAllocationTarget(carried.id);
    return target ? `(${target.x}, ${target.y})` : null;
  }

  protected toggle(popup: MapPopup): void {
    const current = this.openPopup();
    const same = current !== null && current.kind === popup.kind
      && (popup.kind !== 'forklift' || (current.kind === 'forklift' && current.forkliftId === popup.forkliftId))
      && (popup.kind !== 'package' || (current.kind === 'package' && current.package.id === popup.package.id));
    this.openPopup.set(same ? null : popup);
  }

  protected closePopup(): void {
    this.openPopup.set(null);
  }
}
