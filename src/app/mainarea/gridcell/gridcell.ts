import { Component, input, output } from '@angular/core';
import { Coordinate, Direction } from '../../helpers/grid.helpers';
import { GRID_CONFIG } from '../../config/grid.config';

@Component({
  selector: 'app-gridcell',
  imports: [],
  templateUrl: './gridcell.html',
  styleUrl: './gridcell.scss',
  host: {
    '[style.left.px]': 'coordinate().x * gridSize',
    '[style.bottom.px]': 'coordinate().y * gridSize',
    '[class.is-road]': 'isRoad()',
    '[class.is-shelf]': 'isShelf()'
  }
})
export class Gridcell {
  coordinate = input.required<Coordinate>();
  allowedDirections = input.required<Set<Direction>>();
  isRoad = input(false);
  isShelf = input(false);

  protected readonly Direction = Direction;

  protected readonly gridSize = GRID_CONFIG.gridCellSizePx;
}
