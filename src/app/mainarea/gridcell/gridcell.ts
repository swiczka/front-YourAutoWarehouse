import { Component, computed, input, output, Signal } from '@angular/core';
import { Coordinate, Direction } from '../../helpers/grid.helpers';
import { GRID_CONFIG } from '../../config/grid.config';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';

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
    '(click)': 'onCellClicked()'
  }
})
export class Gridcell {
  coordinate = input.required<Coordinate>();
  allowedDirections = input.required<Set<Direction>>();
  isRoad = input(false);
  isShelf = input(false);
  package = input.required<PackageItemReadDto | null>();
  cellClick = output<PackageItemReadDto>();

  protected readonly Direction = Direction;

  gridSize: Signal<number> = computed(() => GRID_CONFIG.gridCellSizePx);

  onCellClicked() {
    const pkg = this.package();
    if (pkg) {
      this.cellClick.emit(pkg);
    }
  }
}
