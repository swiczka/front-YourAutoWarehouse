import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { EditGridCell } from './editgridcell/editgridcell';
import { Coordinate, Direction } from '../helpers/grid.helpers';
import { EditGridService } from '../services/edit-grid-service';
import { GRID_CONFIG } from '../config/grid.config';
import { GridService } from '../services/grid-service';
import { Gridcell } from './gridcell/gridcell';
import { LayoutServiceApi } from '../api-services/layout-service-api';
import { RxStompService } from '../stomp/rx-stomp.service';
import { ForkliftLocationEvent } from '../events/ForkliftLocationEvent';
import { map } from 'rxjs';

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
  private stompService = inject(RxStompService);

  sizeX = signal(7); //this size refers to DRAWING MODE sizes!
  sizeY = signal(7); //this size refers to DRAWING MODE sizes!

  forkliftNumber = signal(5);
  draftForkliftNumber = signal(5);

  editModeEnabled = signal(false);
  drawingModeEnabled = signal(true);

  minSize : number= 6;
  maxSize : number= 12;

  minForklift : number = 1;
  maxForklift : number = 12;

  layoutPresent = signal(false);

  gridWidthPx = computed(() => this.drawingModeEnabled() ? this.sizeX() * GRID_CONFIG.editGridCellSizePx : this.sizeX() * GRID_CONFIG.gridCellSizePx * 2);
  gridHeightPx = computed(() => this.drawingModeEnabled() ? this.sizeY() * GRID_CONFIG.editGridCellSizePx : this.sizeY() * GRID_CONFIG.gridCellSizePx * 2);

  drawingCells = computed(() => this.editGridService.cells());

  cells = computed(() => this.gridService.cells());

  ngOnInit(): void {
    this.layoutServiceApi.getLatestLayout()
    .subscribe(
      {
        next: (layoutDto) => {
          if(layoutDto && layoutDto.gridData && layoutDto.gridData.length > 0){
            this.gridService.setDataFromServer(layoutDto);
            this.sizeX.set(this.gridService.sizeX() / 2);
            this.sizeY.set(this.gridService.sizeY() / 2);
            this.forkliftNumber.set(layoutDto.forkliftNumber);
            this.draftForkliftNumber.set(layoutDto.forkliftNumber);
            this.drawingModeEnabled.set(false);
            this.layoutPresent.set(true);
            console.info(`Found layout for this browser: ${layoutDto.id}`);

            //initializing websocket listening
            this.stompService.watch(`/topic/layout/${layoutDto.id}/forklifts`)
              .pipe(
                map((message): ForkliftLocationEvent => JSON.parse(message.body))
              )
              .subscribe((event) => {
                console.info(`Forklift ${event.forkliftId} is at (${event.x}, ${event.y}) at ${event.timestamp}`);
              });
          }
          else{
            this.editGridService.fillStarterCells(this.sizeX(), this.sizeY());
          }

        },
        error: (error) => {
          console.info('No layout for this browser found:', error);
          this.editGridService.fillStarterCells(this.sizeX(), this.sizeY());
        }
      }
    );
   
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

  getCorrectForkliftNumber(forkliftNumber: number): number {
    return Math.max(this.minForklift, Math.min(this.maxForklift, forkliftNumber));
  }

  handleGridExpansion(request: { origin: Coordinate, direction: Direction}){
    this.editGridService.addCell(request.origin, request.direction);
  }

  confirmLayout() {
    this.gridService.setLayout(this.sizeX(), this.sizeY(), this.drawingCells());
    
    this.layoutServiceApi.postNewLayout(this.gridService.cells()).subscribe({
      next: (response) => {
        console.log('Saved successfully!', response);
        this.drawingModeEnabled.set(false);
        this.layoutPresent.set(true);
      },
      error: (err) => {
        console.error('Server saving error!', err);
        this.drawingModeEnabled.set(true);
      }
    });
  }

    revertForkliftNumber() {
    this.draftForkliftNumber.set(this.forkliftNumber());
  }
    confirmForkliftNumber() {
    this.forkliftNumber.set(this.draftForkliftNumber());
    this.layoutServiceApi.updateForkliftNumber(this.forkliftNumber());
  }
}
