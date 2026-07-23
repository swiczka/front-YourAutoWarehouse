import { Component, input, output } from '@angular/core';
import { Coordinate, Direction } from '../../helpers/grid.helpers';
import { GRID_CONFIG } from '../../config/grid.config';

@Component({
  selector: 'app-editgridcell',
  imports: [],
  templateUrl: './editgridcell.html',
  styleUrl: './editgridcell.scss',
  host: {
    '[style.left.px]': 'coordinate().x * gridSize',
    '[style.bottom.px]': 'coordinate().y * gridSize',
    '[class.is-selected]': 'selected()'
  }
})
export class EditGridCell {
  coordinate = input.required<Coordinate>();
  allowedBranchings = input.required<Direction[]>();
  selected = input(false);

  protected readonly Direction = Direction;
  protected readonly gridSize = GRID_CONFIG.editGridCellSizePx;

  expandRequest = output<{origin: Coordinate, direction: Direction}>();


  go(direction: Direction){
    this.expandRequest.emit({origin: this.coordinate(), direction: direction});
  }
}
