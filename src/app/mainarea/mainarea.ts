import { Component, signal, computed, OnInit, OnDestroy, inject, linkedSignal } from '@angular/core';
import { EditGridCell } from './editgridcell/editgridcell';
import { Coordinate, Direction } from '../helpers/grid.helpers';
import { EditGridService } from '../services/edit-grid-service';
import { GRID_CONFIG } from '../config/grid.config';
import { GridService } from '../services/grid-service';
import { Gridcell } from './gridcell/gridcell';
import { ForkliftService } from '../services/forklift-service';
import { Forklift } from "../components/forklift/forklift";
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { OrderPanel } from '../components/order-panel/order-panel';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import { OrdersView } from '../components/orders-view/orders-view';
import { PackageItemService } from '../services/package-item-service';
import { PackageItemReadDto } from '../dto/PackageItemReadDto';
import { PackagePopup } from '../components/package-popup/package-popup';
import { DeliveryZone } from '../components/delivery-zone/delivery-zone';
import { SendingZone } from '../components/sending-zone/sending-zone';
import { LayoutStateService } from '../services/layout-state-service';

@Component({
  selector: 'app-mainarea',
  imports: [EditGridCell,
    Gridcell,
    MatSidenavModule,
    Forklift,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    OrderPanel,
    OrdersView,
    MatIconModule,
    PackagePopup,
    DeliveryZone,
    SendingZone],
  templateUrl: './mainarea.html',
  styleUrl: './mainarea.scss',
})
export class Mainarea implements OnInit, OnDestroy{

  private editGridService = inject(EditGridService);
  private gridService = inject(GridService)
  private forkliftService = inject(ForkliftService);
  private packageService = inject(PackageItemService);
  private layoutState = inject(LayoutStateService);

  readonly allocatedPackages = this.packageService.allocatedPackages;
  readonly droppedPackages = this.packageService.droppedPackages;

  // layout state lives in LayoutStateService (shared with the header)
  readonly sizeX = this.layoutState.sizeX;
  readonly sizeY = this.layoutState.sizeY;
  readonly layoutId = this.layoutState.layoutId;
  readonly forkliftNumber = this.layoutState.forkliftNumber;
  readonly drawingModeEnabled = this.layoutState.drawingModeEnabled;
  readonly layoutPresent = this.layoutState.layoutPresent;

  // resets to the saved value whenever another layout is loaded
  draftForkliftNumber = linkedSignal(() => this.forkliftNumber());

  editModeEnabled = signal(false);

  minSize : number= 6;
  maxSize : number= 12;

  minForklift : number = 1;
  maxForklift : number = 12;

  gridWidthPx = computed(() => this.drawingModeEnabled() ? this.sizeX() * GRID_CONFIG.editGridCellSizePx : this.sizeX() * GRID_CONFIG.gridCellSizePx * 2);
  gridHeightPx = computed(() => this.drawingModeEnabled() ? this.sizeY() * GRID_CONFIG.editGridCellSizePx : this.sizeY() * GRID_CONFIG.gridCellSizePx * 2);

  drawingCells = computed(() => this.editGridService.cells());

  cells = computed(() => this.gridService.cells());
  forklifts = computed(() => this.forkliftService.forklifts());

  sidebarOpened = signal(false);

  orderPanelMode = signal<"new" | "inbound" | "outbound">("new");
  // closes the package popup whenever another layout is loaded
  selectedPackage = linkedSignal<number | null, PackageItemReadDto | null>({
    source: this.layoutId,
    computation: () => null
  });

  ngOnInit(): void {
    this.layoutState.init();
  }

  ngOnDestroy(): void {
    this.layoutState.destroy();
  }

  getPackageByCoord(x: number, y: number) : PackageItemReadDto | null {
    return this.packageService.getByCoords(x, y);
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
    this.layoutState.saveDrawnLayout();
  }

    revertForkliftNumber() {
    this.draftForkliftNumber.set(this.forkliftNumber());
  }
    confirmForkliftNumber() {
    this.layoutState.updateForkliftNumber(this.draftForkliftNumber());
  }
}
