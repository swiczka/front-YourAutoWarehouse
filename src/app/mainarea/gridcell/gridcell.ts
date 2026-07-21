import { Component, input, output } from '@angular/core';
import { Coordinate, Direction } from '../../helpers/grid.helpers';

@Component({
  selector: 'app-gridcell',
  imports: [],
  templateUrl: './gridcell.html',
  styleUrl: './gridcell.scss',
  host: {
    '[style.left.px]': 'coordinate().x * 50',
    '[style.bottom.px]': 'coordinate().y * 50',
    '[class.is-selected]': 'selected()'
  }
})
export class Gridcell {
  coordinate = input.required<Coordinate>();
  allowedBranchings = input.required<Direction[]>();
  selected = input(false);

  protected readonly Direction = Direction;

  expandRequest = output<{origin: Coordinate, direction: Direction}>();


  go(direction: Direction){
    this.expandRequest.emit({origin: this.coordinate(), direction: direction});
  }
}
