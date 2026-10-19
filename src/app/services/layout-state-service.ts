import { computed, inject, Service, signal } from '@angular/core';
import { Subscription, map } from 'rxjs';
import { ToastService } from './toast-service';
import { EventFeedService, FEED_TOPICS } from './event-feed-service';
import { LayoutServiceApi } from '../api-services/layout-service-api';
import { RxStompService } from '../stomp/rx-stomp.service';
import { EditGridService } from './edit-grid-service';
import { GridService } from './grid-service';
import { ForkliftService } from './forklift-service';
import { PackageItemService } from './package-item-service';
import { LayoutIdDto } from '../dto/LayoutIdDto';
import { LayoutDto } from '../dto/LayoutDto';
import { ForkliftLocationEvent } from '../events/ForkliftLocationEvent';
import { PackageSocketEvent } from '../events/PackageLocationEvent';
import { PackageDroppedEvent } from '../events/PackageDroppedEvent';

// Which layout is open and in which mode (drawing a new one / watching a saved one).
// Shared by the header (layout picker) and the main area (map, editor).
@Service()
export class LayoutStateService {
  private layoutServiceApi = inject(LayoutServiceApi);
  private stompService = inject(RxStompService);
  private editGridService = inject(EditGridService);
  private gridService = inject(GridService);
  private forkliftService = inject(ForkliftService);
  private packageService = inject(PackageItemService);
  private toast = inject(ToastService);
  private eventFeed = inject(EventFeedService);

  private stompSubscriptions: Subscription[] = [];

  readonly availableLayouts = signal<LayoutIdDto[]>([]);
  readonly formattedLayouts = computed(() =>
    this.availableLayouts().map(layout => ({
      id: layout.id,
      label: this.formatLayoutLabel(layout)
    }))
  );

  readonly sizeX = signal(7); //this size refers to DRAWING MODE sizes!
  readonly sizeY = signal(7); //this size refers to DRAWING MODE sizes!

  readonly layoutId = signal<number | null>(null);
  readonly forkliftNumber = signal(5);

  readonly drawingModeEnabled = signal(true);
  readonly layoutPresent = signal(false);

  init(): void {
    this.loadUserLayouts();

    this.layoutServiceApi.getLatestLayout()
    .subscribe(
      {
        next: (layoutDto) => {
          if(layoutDto && layoutDto.gridData && layoutDto.gridData.length > 0){
            this.showLayout(layoutDto);
            console.info(`Found layout for this browser: ${layoutDto.id}`);
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

  destroy(): void {
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

  selectLayout(id: number): void {
    this.layoutServiceApi.getLayoutById(id).subscribe({
      next: (layoutDto) => {
        if (layoutDto && layoutDto.gridData && layoutDto.gridData.length > 0) {
          this.forkliftService.forklifts.set(new Map());
          this.packageService.deliveredPackages.set([]);
          this.packageService.sentPackages.set([]);
          this.packageService.carriedByForklift.set(new Map());

          this.showLayout(layoutDto);
          this.toast.success('UKŁAD ZAŁADOWANY', `Układ #${layoutDto.id} jest otwarty.`);
        } else {
          this.toast.error('PUSTY UKŁAD', `Układ #${id} nie zawiera danych siatki.`);
        }
      },
      error: (err: unknown) => {
        console.error('Błąd podczas pobierania układu:', err);
        this.toast.error('NIE UDAŁO SIĘ WCZYTAĆ UKŁADU', `Nie udało się pobrać układu #${id}.`);
      }
    });
  }

  startNewLayout(): void {
    this.clearStompSubscriptions();
    this.eventFeed.clear();
    this.layoutId.set(null);
    this.layoutPresent.set(false);
    this.drawingModeEnabled.set(true);

    this.sizeX.set(7);
    this.sizeY.set(7);
    this.forkliftNumber.set(5);

    this.editGridService.fillStarterCells(this.sizeX(), this.sizeY());
    this.gridService.cells.set(new Map());
    this.forkliftService.forklifts.set(new Map());
    this.packageService.packages.set([]);
    this.packageService.deliveredPackages.set([]);
    this.packageService.sentPackages.set([]);
    this.packageService.carriedByForklift.set(new Map());
  }

  saveDrawnLayout(): void {
    this.gridService.setLayout(this.sizeX(), this.sizeY(), this.editGridService.cells());

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
          this.loadUserLayouts();
          this.listenToLayout(newId);
          this.toast.success('UKŁAD ZAPISANY', `Nowy układ #${newId} jest gotowy do pracy.`);
        }
      },
      error: (err) => {
        console.error('Server saving error!', err);
        this.drawingModeEnabled.set(true);
        this.toast.error('NIE UDAŁO SIĘ ZAPISAĆ UKŁADU', 'Serwer nie odpowiada. Spróbuj ponownie za chwilę.');
      }
    });
  }

  updateForkliftNumber(forkliftNumber: number): void {
    this.forkliftNumber.set(forkliftNumber);
    this.layoutServiceApi.updateForkliftNumber(forkliftNumber);
  }

  private showLayout(layoutDto: LayoutDto): void {
    this.gridService.setDataFromServer(layoutDto);
    this.sizeX.set(this.gridService.sizeX() / 2);
    this.sizeY.set(this.gridService.sizeY() / 2);
    this.forkliftNumber.set(layoutDto.forkliftNumber);
    this.drawingModeEnabled.set(false);
    this.layoutPresent.set(true);
    this.layoutId.set(layoutDto.id);

    //initializing websocket listening
    this.listenToLayout(layoutDto.id);
  }

  private listenToLayout(layoutId: number): void {
    this.clearStompSubscriptions();
    this.eventFeed.clear();
    this.initializeForkliftStompListening(layoutId);
    this.initializePackageStompListening(layoutId);
    this.initializePackageDroppedStompListening(layoutId);
    this.packageService.addPackagesOnLayoutInit(layoutId);
  }

  private formatLayoutLabel(layout: LayoutIdDto): string {
    if (!layout.createdAt) {
      return `#${layout.id}`;
    }
    try {
      const date = new Date(layout.createdAt);
      if (isNaN(date.getTime())) {
        return `#${layout.id} · ${layout.createdAt}`;
      }
      const formattedDate = new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
      return `#${layout.id} · ${formattedDate}`;
    } catch {
      return `#${layout.id}`;
    }
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
                this.eventFeed.record(FEED_TOPICS.forkliftLocation, `Wózek #${event.forkliftId} → (${event.x}, ${event.y})`, event.timestamp);
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
                  this.eventFeed.record(FEED_TOPICS.packageAllocated, `Paczka #${event.packageId} „${event.name}” → półka (${event.targetX}, ${event.targetY})`);
              } else if ('x' in event && 'y' in event) {
                  console.info(`Package ${event.packageId} moved to (${event.x}, ${event.y})`);
                  this.packageService.handleStoredEvent(event);
                  this.eventFeed.record(FEED_TOPICS.packageStored, `Paczka #${event.packageId} odłożona na (${event.x}, ${event.y})`);
              } else {
                  console.info(`Package ${event.packageId} picked by forklift ${event.forkliftId}`);
                  this.packageService.handlePickedEvent(event);
                  const task = event.taskType === 'OUTBOUND' ? 'wydanie' : 'dostawa';
                  this.eventFeed.record(FEED_TOPICS.packagePicked, `Paczka #${event.packageId} · wózek #${event.forkliftId} · ${task}`);
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
                  this.eventFeed.record(FEED_TOPICS.packageDropped, `Paczka #${event.packageId} w strefie wydań`);
              });
     this.stompSubscriptions.push(sub);
  }
}
