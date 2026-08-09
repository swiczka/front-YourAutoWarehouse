import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { EditGridCell } from './editgridcell/editgridcell';
import { Coordinate, Direction } from '../helpers/grid.helpers';
import { EditGridService } from '../services/edit-grid-service';
import { GRID_CONFIG } from '../config/grid.config';
import { GridService } from '../services/grid-service';
import { Gridcell } from './gridcell/gridcell';
import { LayoutServiceApi } from '../api-services/layout-service-api';

@Component({
  selector: 'app-mainarea',
  imports: [EditGridCell, Gridcell],
  templateUrl: './mainarea.html',
  styleUrl: './mainarea.scss',
})
export class Mainarea implements OnInit{

  private editGridService = inject(EditGridService);
  private gridService = inject(GridService)
  private layoutServiceApi = inject(LayoutServiceApi);

  sizeX = signal(7); //this size refers to DRAWING MODE sizes!
  sizeY = signal(7); //this size refers to DRAWING MODE sizes!

  editModeEnabled = signal(false);
  drawingModeEnabled = signal(true);

  minSize : number= 6;
  maxSize : number= 12;

  gridWidthPx = computed(() => this.drawingModeEnabled() ? this.sizeX() * GRID_CONFIG.editGridCellSizePx : this.sizeX() * GRID_CONFIG.gridCellSizePx * 2);
  gridHeightPx = computed(() => this.drawingModeEnabled() ? this.sizeY() * GRID_CONFIG.editGridCellSizePx : this.sizeY() * GRID_CONFIG.gridCellSizePx * 2);

  drawingCells = computed(() => this.editGridService.cells());

  cells = computed(() => this.gridService.cells());

  ngOnInit(): void {
    this.editGridService.fillStarterCells(this.sizeX(), this.sizeY());
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
    if(!this.gridService.setLayout(this.sizeX(), this.sizeY(), this.drawingCells())){
      this.drawingModeEnabled.set(false);
    }
    const resp = this.layoutServiceApi.postNewLayout(this.gridService.cells());
  }
}
