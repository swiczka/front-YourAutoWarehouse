import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { Gridcell } from './gridcell/gridcell';
import { Coordinate, Direction } from '../helpers/grid.helpers';
import { GridService } from '../services/grid-service';



@Component({
  selector: 'app-mainarea',
  imports: [Gridcell],
  templateUrl: './mainarea.html',
  styleUrl: './mainarea.scss',
})
export class Mainarea implements OnInit{
  
  private gridService = inject(GridService);

  sizeX = signal(10);
  sizeY = signal(10);

  editModeEnabled = signal(false);

  minSize : number= 8;
  maxSize : number= 16;

  gridWidthPx = computed(() => this.sizeX() * 50);
  gridHeightPx = computed(() => this.sizeY() * 50);

  cells = computed(() => this.gridService.cells());

  ngOnInit(): void {
    this.gridService.fillStarterCells();
  }

  editModeToggle() { this.editModeEnabled.set(!this.editModeEnabled()) }

  getCorrectSize(size: number) {
    return Math.max(this.minSize, Math.min(this.maxSize, size));
  }

  handleGridExpansion(request: { origin: Coordinate, direction: Direction}){
    this.gridService.addCell(request.origin, request.direction);
  }

}
