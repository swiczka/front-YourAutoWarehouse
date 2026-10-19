import { Component, computed, input, output } from '@angular/core';
import { PanelPopup } from '../ui/panel-popup/panel-popup';
import { getForkliftColor } from '../../config/forklift.config';

@Component({
  selector: 'app-garage-zone',
  imports: [PanelPopup],
  templateUrl: './garage-zone.html',
  styleUrl: './garage-zone.scss',
  host: {
    '[class.is-open]': 'open()',
  },
})
export class GarageZone {
  // ids of forklifts parked in the garage (available for new tasks)
  forkliftIds = input.required<number[]>();
  open = input(false);
  toggle = output<void>();

  protected readonly forklifts = computed(() =>
    this.forkliftIds().map(id => ({ id, color: getForkliftColor(id) }))
  );
}
