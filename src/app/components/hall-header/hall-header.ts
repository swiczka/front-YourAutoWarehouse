import { Component, computed, inject } from '@angular/core';
import { LayoutStateService } from '../../services/layout-state-service';
import { GridService } from '../../services/grid-service';
import { ForkliftService } from '../../services/forklift-service';
import { PackageItemService } from '../../services/package-item-service';

// Title of the open hall plus live counters above the map.
@Component({
  selector: 'app-hall-header',
  imports: [],
  templateUrl: './hall-header.html',
  styleUrl: './hall-header.scss',
})
export class HallHeader {
  private layoutState = inject(LayoutStateService);
  private gridService = inject(GridService);
  private forkliftService = inject(ForkliftService);
  private packageService = inject(PackageItemService);

  protected readonly layoutId = this.layoutState.layoutId;
  protected readonly sizeX = this.gridService.sizeX;
  protected readonly sizeY = this.gridService.sizeY;

  // forklifts on (0, 0) are parked in the garage
  private readonly movingCount = computed(() =>
    [...this.forkliftService.forklifts().values()].filter(forklift => !(forklift.x === 0 && forklift.y === 0)).length
  );

  protected readonly stats = computed(() => [
    { value: this.movingCount(), label: 'Wózki w ruchu' },
    { value: Math.max(0, this.layoutState.forkliftNumber() - this.movingCount()), label: 'W garażu' },
    { value: this.packageService.packages().length, label: 'Paczki na półkach' },
    { value: this.packageService.allocatedPackages().length, label: 'Paczki w strefie dostaw' },
  ]);
}
