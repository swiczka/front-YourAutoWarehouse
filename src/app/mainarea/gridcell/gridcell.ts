import { Component, computed, inject, input, output, Signal } from '@angular/core';
import { Coordinate, Direction } from '../../helpers/grid.helpers';
import { GRID_CONFIG } from '../../config/grid.config';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';
import { SettingsService } from '../../services/settings-service';

@Component({
  selector: 'app-gridcell',
  imports: [],
  templateUrl: './gridcell.html',
  styleUrl: './gridcell.scss',
  host: {
    '[style.left.px]': 'coordinate().x * gridSize()',
    '[style.bottom.px]': 'coordinate().y * gridSize()',
    '[class.is-road]': 'isRoad()',
    '[class.is-shelf]': 'isShelf()',
    '[class.has-package]': 'package() !== null',
  }
})
export class Gridcell {
  coordinate = input.required<Coordinate>();
  allowedDirections = input.required<Set<Direction>>();
  isRoad = input(false);
  isShelf = input(false);
  package = input.required<PackageItemReadDto | null>();
  // package popup of this cell is open (or the package is picked for an order)
  highlighted = input(false);
  cellClick = output<PackageItemReadDto>();

  protected readonly Direction = Direction;
  protected readonly showCoordinates = inject(SettingsService).showCoordinates;

  gridSize: Signal<number> = computed(() => GRID_CONFIG.gridCellSizePx);

  onCellClicked() {
    const pkg = this.package();
    if (pkg) {
      this.cellClick.emit(pkg);
    }
  }
}
