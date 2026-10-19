import { Component, computed, input, output } from '@angular/core';
import { getForkliftColor } from '../../config/forklift.config';
import { GRID_CONFIG } from '../../config/grid.config';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';
import { PanelPopup } from '../ui/panel-popup/panel-popup';

@Component({
  selector: 'app-forklift',
  imports: [PanelPopup],
  templateUrl: './forklift.html',
  styleUrl: './forklift.scss',
  host: {
    '[style.--forklift-color]': 'forkliftColor()',
    '[style.left.px]': 'x() * gridCellSize()',
    '[style.bottom.px]': 'y() * gridCellSize()',
    '[class.is-selected]': 'selected()',
  },
})
export class Forklift {
  readonly id = input.required<number>();
  x = input(0);
  y = input(0);
  readonly facing = input<'left' | 'right'>('right');
  // package on the forks and where it is going (shelf "(x, y)" or the dispatch zone)
  readonly carried = input<PackageItemReadDto | null>(null);
  readonly destination = input<string | null>(null);
  readonly selected = input(false);
  readonly toggle = output<void>();

  readonly gridCellSize = computed(() => GRID_CONFIG.gridCellSizePx);
  protected readonly forkliftColor = computed(() => getForkliftColor(this.id()));
  protected readonly label = computed(() =>
    `Wózek ${this.id()}, ${this.carried() ? 'wiezie paczkę' : 'bez ładunku'}`
  );
}
