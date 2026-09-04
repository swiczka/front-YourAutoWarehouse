import { Component, computed, input, signal } from '@angular/core';
import { getForkliftColor } from '../../config/forklift.config';
import { GRID_CONFIG } from '../../config/grid.config';

@Component({
  selector: 'app-forklift',
  imports: [],
  templateUrl: './forklift.html',
  styleUrl: './forklift.scss',
  host: {
    '[style.--forklift-color]': 'forkliftColor()',
    '[style.left.px]': 'x() * gridCellSize()',
    '[style.bottom.px]': 'y() * gridCellSize()',
  },
})
export class Forklift {
  readonly id = input.required<number>();
  x = input(0);
  y = input(0);

  readonly gridCellSize = computed(() => GRID_CONFIG.gridCellSizePx);
  protected readonly forkliftColor = computed(() => getForkliftColor(this.id()));
}
