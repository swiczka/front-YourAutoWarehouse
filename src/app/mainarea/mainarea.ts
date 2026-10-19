import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { EditGridCell } from './editgridcell/editgridcell';
import { Coordinate, Direction } from '../helpers/grid.helpers';
import { EditGridService } from '../services/edit-grid-service';
import { GRID_CONFIG } from '../config/grid.config';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { OrdersPanel } from '../components/orders-panel/orders-panel';
import { LayoutStateService } from '../services/layout-state-service';
import { HallHeader } from '../components/hall-header/hall-header';
import { WarehouseMap } from '../components/warehouse-map/warehouse-map';
import { EventFeed } from '../components/event-feed/event-feed';

@Component({
  selector: 'app-mainarea',
  imports: [EditGridCell,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    OrdersPanel,
    HallHeader,
    WarehouseMap,
    EventFeed],
  templateUrl: './mainarea.html',
  styleUrl: './mainarea.scss',
})
export class Mainarea implements OnInit, OnDestroy{

  private editGridService = inject(EditGridService);
  private layoutState = inject(LayoutStateService);

  // layout state lives in LayoutStateService (shared with the header)
  readonly sizeX = this.layoutState.sizeX;
  readonly sizeY = this.layoutState.sizeY;
  readonly layoutId = this.layoutState.layoutId;
  readonly drawingModeEnabled = this.layoutState.drawingModeEnabled;

  editModeEnabled = signal(false);

  minSize : number= 6;
  maxSize : number= 12;

  gridWidthPx = computed(() => this.sizeX() * GRID_CONFIG.editGridCellSizePx);
  gridHeightPx = computed(() => this.sizeY() * GRID_CONFIG.editGridCellSizePx);

  drawingCells = computed(() => this.editGridService.cells());

  ngOnInit(): void {
    this.layoutState.init();
  }

  ngOnDestroy(): void {
    this.layoutState.destroy();
  }

  editModeToggle() {
    this.editModeEnabled.set(!this.editModeEnabled())

    if(!this.editModeEnabled()){
      this.editGridService.changeDimensions(this.sizeX(), this.sizeY());
    }
  }

  getCorrectSize(size: number) {
    return Math.max(this.minSize, Math.min(this.maxSize, size));
  }

  handleGridExpansion(request: { origin: Coordinate, direction: Direction}){
    this.editGridService.addCell(request.origin, request.direction);
  }

  confirmLayout() {
    this.layoutState.saveDrawnLayout();
  }
}
