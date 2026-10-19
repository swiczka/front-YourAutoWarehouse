import { Component, computed, input, output } from '@angular/core';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';
import { GRID_CONFIG } from '../../config/grid.config';
import { PanelPopup } from '../ui/panel-popup/panel-popup';
import { getStatusView } from '../../helpers/status.helpers';

@Component({
  selector: 'app-package-popup',
  imports: [PanelPopup],
  templateUrl: './package-popup.html',
  styleUrl: './package-popup.scss',
  host: {
    '[style.left.px]': 'leftPx()',
    '[style.bottom.px]': 'bottomPx()',
  },
})
export class PackagePopup {
  package = input.required<PackageItemReadDto>();
  close = output<void>();

  protected readonly status = computed(() => getStatusView(this.package().status));

  // Pozycjonujemy popup u dołu klikniętej kratki (w dół od kratki)
  protected readonly leftPx = computed(() => this.package().x * GRID_CONFIG.gridCellSizePx);
  protected readonly bottomPx = computed(() => this.package().y * GRID_CONFIG.gridCellSizePx);
}
