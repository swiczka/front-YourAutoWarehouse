import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { EditGridCell } from './editgridcell/editgridcell';
import { Coordinate, Direction } from '../helpers/grid.helpers';
import { EditGridService } from '../services/edit-grid-service';
import { GRID_CONFIG } from '../config/grid.config';
import { GridService } from '../services/grid-service';
import { Gridcell } from './gridcell/gridcell';
import { LayoutServiceApi } from '../api-services/layout-service-api';
import { RxStompService } from '../stomp/rx-stomp.service';
import { ForkliftLocationEvent } from '../events/ForkliftLocationEvent';
import { Subscription, map } from 'rxjs';
import { ForkliftService } from '../services/forklift-service';
import { Forklift } from "../components/forklift/forklift";
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import { OrderPanel } from '../components/order-panel/order-panel';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import { OrdersView } from '../components/orders-view/orders-view';
import { PackageItemService } from '../services/package-item-service';
import { PackageItemReadDto } from '../dto/PackageItemReadDto';
import { PackagePopup } from '../components/package-popup/package-popup';
import { PackageSocketEvent } from '../events/PackageLocationEvent';
import { DeliveryZone } from '../components/delivery-zone/delivery-zone';
import { SendingZone } from '../components/sending-zone/sending-zone';
import { PackageDroppedEvent } from '../events/PackageDroppedEvent';
import { LayoutIdDto } from '../dto/LayoutIdDto';

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
    MatSelectModule,
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
  private layoutServiceApi = inject(LayoutServiceApi);
  private stompService = inject(RxStompService);
  private forkliftService = inject(ForkliftService);
  private packageService = inject(PackageItemService);

  readonly allocatedPackages = this.packageService.allocatedPackages;
  readonly droppedPackages = this.packageService.droppedPackages;

  availableLayouts = signal<LayoutIdDto[]>([]);
  formattedLayouts = computed(() =>
    this.availableLayouts().map(layout => ({
      id: layout.id,
      label: this.formatLayoutLabel(layout)
    }))
  );
  selectedLayoutDraft = signal<number | 'new' | null>(null);
  private stompSubscriptions: Subscription[] = [];

  sizeX = signal(7); //this size refers to DRAWING MODE sizes!
  sizeY = signal(7); //this size refers to DRAWING MODE sizes!

  layoutId = signal<number | null>(null);

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
  forklifts = computed(() => this.forkliftService.forklifts());

  private _snackBar = inject(MatSnackBar);
  sidebarOpened = signal(false);

  orderPanelMode = signal<"new" | "inbound" | "outbound">("new");
  selectedPackage = signal<PackageItemReadDto | null>(null);

  ngOnInit(): void {
    this.loadUserLayouts();

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
            this.layoutId.set(layoutDto.id);
            this.selectedLayoutDraft.set(layoutDto.id);
            console.info(`Found layout for this browser: ${layoutDto.id}`);

            //initializing websocket listening
            this.clearStompSubscriptions();
            this.initializeForkliftStompListening(layoutDto.id);
            this.initializePackageStompListening(layoutDto.id);
            this.initializePackageDroppedStompListening(layoutDto.id);
            
            this.packageService.addPackagesOnLayoutInit(layoutDto.id);
          }
          else{
            this.selectedLayoutDraft.set('new');
            this.editGridService.fillStarterCells(this.sizeX(), this.sizeY());
          }

        },
        error: (error) => {
          console.info('No layout for this browser found:', error);
          this.selectedLayoutDraft.set('new');
          this.editGridService.fillStarterCells(this.sizeX(), this.sizeY());
        }
      }
    );
    
    this.stompService.stompErrors$.subscribe({
      next: (error) => {
        if(!this._snackBar._openedSnackBarRef) 
          this.openSnackBar("Nie można nawiązać połączenia z serwerem.")
      }
    });
      
    this.stompService.webSocketErrors$.subscribe({
      next: (error) => {
        if(!this._snackBar._openedSnackBarRef) 
          this.openSnackBar("Nie można nawiązać połączenia z serwerem.")
      }
    });
  }

  ngOnDestroy(): void {
    this.clearStompSubscriptions();
  }

  loadUserLayouts(): void {
    this.layoutServiceApi.getUserLayoutIds().subscribe({
      next: (layouts) => {
        this.availableLayouts.set(layouts);
      },
      error: (err: unknown) => {
        console.error('Błąd pobierania listy layoutów:', err);
      }
    });
  }

  formatLayoutLabel(layout: LayoutIdDto): string {
    if (!layout.createdAt) {
      return `ID: ${layout.id}`;
    }
    try {
      const date = new Date(layout.createdAt);
      if (isNaN(date.getTime())) {
        return `ID: ${layout.id}, ${layout.createdAt}`;
      }
      const formattedDate = new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
      return `ID: ${layout.id}, ${formattedDate}`;
    } catch {
      return `ID: ${layout.id}`;
    }
  }

  applySelectedLayout(): void {
    const selected = this.selectedLayoutDraft();
    if (selected === null) {
      return;
    }

    if (selected === 'new') {
      this.clearStompSubscriptions();
      this.layoutId.set(null);
      this.layoutPresent.set(false);
      this.drawingModeEnabled.set(true);
      this.sidebarOpened.set(false);
      this.selectedPackage.set(null);

      this.sizeX.set(7);
      this.sizeY.set(7);
      this.forkliftNumber.set(5);
      this.draftForkliftNumber.set(5);

      this.editGridService.fillStarterCells(this.sizeX(), this.sizeY());
      this.gridService.cells.set(new Map());
      this.forkliftService.forklifts.set(new Map());
      this.packageService.packages.set([]);
      this.packageService.deliveredPackages.set([]);
      this.packageService.sentPackages.set([]);

      this.openSnackBar("Zresetowano układ do trybu tworzenia nowego.");
      return;
    }

    this.layoutServiceApi.getLayoutById(selected).subscribe({
      next: (layoutDto) => {
        if (layoutDto && layoutDto.gridData && layoutDto.gridData.length > 0) {
          this.clearStompSubscriptions();

          this.gridService.setDataFromServer(layoutDto);
          this.sizeX.set(this.gridService.sizeX() / 2);
          this.sizeY.set(this.gridService.sizeY() / 2);
          this.forkliftNumber.set(layoutDto.forkliftNumber);
          this.draftForkliftNumber.set(layoutDto.forkliftNumber);
          this.drawingModeEnabled.set(false);
          this.layoutPresent.set(true);
          this.layoutId.set(layoutDto.id);
          this.selectedPackage.set(null);

          this.forkliftService.forklifts.set(new Map());
          this.packageService.deliveredPackages.set([]);
          this.packageService.sentPackages.set([]);

          this.initializeForkliftStompListening(layoutDto.id);
          this.initializePackageStompListening(layoutDto.id);
          this.initializePackageDroppedStompListening(layoutDto.id);

          this.packageService.addPackagesOnLayoutInit(layoutDto.id);
          this.openSnackBar(`Załadowano układ ID: ${layoutDto.id}`);
        } else {
          this.openSnackBar(`Układ ID: ${selected} nie zawiera danych siatki.`);
        }
      },
      error: (err: unknown) => {
        console.error('Błąd podczas pobierania układu:', err);
        this.openSnackBar(`Nie udało się pobrać układu ID: ${selected}`);
      }
    });
  }

  private clearStompSubscriptions(): void {
    for (const sub of this.stompSubscriptions) {
      sub.unsubscribe();
    }
    this.stompSubscriptions = [];
  }

  private initializeForkliftStompListening(layoutId: number) {
     const sub = this.stompService.watch(`/topic/layout/${layoutId}/forklifts`)
              .pipe(
                map((message): ForkliftLocationEvent => JSON.parse(message.body))
              )
              .subscribe((event) => {
                console.info(`Forklift ${event.forkliftId} is at (${event.x}, ${event.y}) at ${event.timestamp}`);
                this.forkliftService.handleLocationEvent(event);
              });
     this.stompSubscriptions.push(sub);
  }

  private initializePackageStompListening(layoutId: number) {
     const sub = this.stompService.watch(`/topic/layout/${layoutId}/packages`)
              .pipe(
                map((message): PackageSocketEvent => JSON.parse(message.body))
              )
              .subscribe((event: PackageSocketEvent) => {
              if ('inboundOrderId' in event) {
                  console.info(`New package allocated: ${event.name} at (${event.currentX}, ${event.currentY})`);
                  this.packageService.handleAllocatedEvent(event);
              } else if ('x' in event && 'y' in event) {
                  console.info(`Package ${event.packageId} moved to (${event.x}, ${event.y})`);
                  this.packageService.handleStoredEvent(event);
              } else {
                  console.info(`Package ${event.packageId} picked by forklift ${event.forkliftId}`);
                  this.packageService.handlePickedEvent(event);
              }
              });
     this.stompSubscriptions.push(sub);
  }

  private initializePackageDroppedStompListening(layoutId: number) {
     const sub = this.stompService.watch(`/topic/layout/${layoutId}/packages/dropped`)
              .pipe(
                map((message): PackageDroppedEvent => JSON.parse(message.body))
              )
              .subscribe((event: PackageDroppedEvent) => {
                  console.info(`Package ${event.packageId} dropped at (${event.x}, ${event.y})`);
                  this.packageService.handleDroppedEvent(event);
              });
     this.stompSubscriptions.push(sub);
  }

  getPackageByCoord(x: number, y: number) : PackageItemReadDto | null {
    return this.packageService.getByCoords(x, y);
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, "Zamknij");
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
        const newId = response && typeof response === 'object' && 'id' in response
          ? (response as { id: number }).id
          : null;
        this.layoutId.set(newId);
        if (newId !== null) {
          this.selectedLayoutDraft.set(newId);
          this.loadUserLayouts();
          this.clearStompSubscriptions();
          this.initializeForkliftStompListening(newId);
          this.initializePackageStompListening(newId);
          this.initializePackageDroppedStompListening(newId);
          this.packageService.addPackagesOnLayoutInit(newId);
        }
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
