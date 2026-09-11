import { Component, computed, input, output } from '@angular/core';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';
import { GRID_CONFIG } from '../../config/grid.config';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-package-popup',
  imports: [MatTableModule, MatButtonModule],
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

  displayedColumns: string[] = ['id', 'name', 'status', 'orderId'];
  dataSource = computed(() => [this.package()]);

  // Pozycjonujemy popup u dołu klikniętej kratki (w dół od kratki)
  protected readonly leftPx = computed(() => this.package().x * GRID_CONFIG.gridCellSizePx);
  protected readonly bottomPx = computed(() => this.package().y * GRID_CONFIG.gridCellSizePx);
}
