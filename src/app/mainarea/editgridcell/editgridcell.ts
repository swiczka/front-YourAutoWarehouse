import { Component, computed, inject, input, output } from '@angular/core';
import { Coordinate, Direction } from '../../helpers/grid.helpers';
import { GRID_CONFIG } from '../../config/grid.config';
import { SettingsService } from '../../services/settings-service';

// the side of the cell touching the road it grows out of
const GROW_ORIGIN: Record<Direction, string> = {
  [Direction.UP]: 'bottom',
  [Direction.DOWN]: 'top',
  [Direction.LEFT]: 'right',
  [Direction.RIGHT]: 'left',
};

const ARROW_ROTATION: Record<Direction, string> = {
  [Direction.UP]: 'rotate(0deg)',
  [Direction.DOWN]: 'rotate(180deg)',
  [Direction.LEFT]: 'rotate(-90deg)',
  [Direction.RIGHT]: 'rotate(90deg)',
};

@Component({
  selector: 'app-editgridcell',
  imports: [],
  templateUrl: './editgridcell.html',
  styleUrl: './editgridcell.scss',
  host: {
    '[style.left.px]': 'coordinate().x * gridSize',
    '[style.bottom.px]': 'coordinate().y * gridSize',
    '[class.is-selected]': 'selected() && grownFrom() === null',
  }
})
export class EditGridCell {
  coordinate = input.required<Coordinate>();
  selected = input(false);
  // empty cell a neighbouring road may extend into: the road's cell and the direction to here
  extendFrom = input<{ origin: Coordinate, direction: Direction } | null>(null);
  // road cell added a moment ago: direction it was drawn in (plays the grow animation)
  grownFrom = input<Direction | null>(null);

  protected readonly gridSize = GRID_CONFIG.editGridCellSizePx;
  protected readonly showCoordinates = inject(SettingsService).showCoordinates;

  protected readonly arrowRotation = computed(() => {
    const extend = this.extendFrom();
    return extend ? ARROW_ROTATION[extend.direction] : 'none';
  });

  protected readonly growAxis = computed(() => {
    const direction = this.grownFrom();
    return direction === Direction.LEFT || direction === Direction.RIGHT ? 'x' : 'y';
  });

  protected readonly growOrigin = computed(() => {
    const direction = this.grownFrom();
    return direction === null ? 'center' : GROW_ORIGIN[direction];
  });

  expandRequest = output<{origin: Coordinate, direction: Direction}>();

  extend() {
    const extend = this.extendFrom();
    if (extend) {
      this.expandRequest.emit(extend);
    }
  }
}
