import { computed, inject, Service, signal } from '@angular/core';
import { PackageItemReadDto } from '../dto/PackageItemReadDto';
import { PackageItemServiceApi } from '../api-services/package-item-service-api';
import { Coordinate } from '../helpers/grid.helpers';
import { InboundOrderDto } from '../dto/InboundOrderDto';
import { PackageAllocatedEvent, PackagePickedEvent, PackageStoredEvent } from '../events/PackageLocationEvent';
import { PackageDroppedEvent } from '../events/PackageDroppedEvent';

@Service()
export class PackageItemService {
    
    packages = signal<PackageItemReadDto[]>([]);

    deliveredPackages = signal<PackageItemReadDto[]>([]);

    sentPackages = signal<PackageItemReadDto[]>([]);

    // shelf chosen by the backend for each package waiting in the delivery zone
    allocationTargets = signal<Map<number, Coordinate>>(new Map());

    // package currently on the forks, by forklift id
    carriedByForklift = signal<Map<number, PackageItemReadDto>>(new Map());

    readonly allocatedPackages = computed(() =>
        this.deliveredPackages().filter(pkg => pkg.status === 'ALLOCATED')
    );

    readonly storedPackages = computed(() =>
        this.packages().filter(pkg => pkg.status === 'STORED' && !pkg.outboundOrderId)
    );

    readonly droppedPackages = computed(() =>
        this.sentPackages().filter(pkg => pkg.status === 'DROPPED')
    );

    readonly packagesByCoords = computed(() => {
        const lookup = new Map<string, PackageItemReadDto>();
        for (const pkg of this.packages()) {
            lookup.set(this.cordsToKey(pkg.x, pkg.y), pkg);
        }
        return lookup;
    });

    packageServiceApi = inject(PackageItemServiceApi);

    addPackagesOnLayoutInit(layoutId: number){
        this.packageServiceApi.getPackagesByLayoutId(layoutId).subscribe({
            next: (newPackages) => {
                this.packages.set(newPackages);
            },
            error: (error) => {
                console.error('Error fetching packages:', error);
            }
        });
    }

    handleStoredEvent(event: PackageStoredEvent) {
        const pkg = this.deliveredPackages().find(p => p.id === event.packageId);
        if (!pkg) {
            return;
        }
  
        this.deliveredPackages.update(pkgs => pkgs.filter(p => p.id !== event.packageId));

        const storedPackage: PackageItemReadDto = {
            ...pkg,
            x: event.x,
            y: event.y,
            status: 'STORED'
        };

        this.packages.update(pkgs => [...pkgs, storedPackage]);
        this.releaseFromForklift(event.packageId);
    }

    handlePickedEvent(event: PackagePickedEvent) {
        if(event.taskType === "INBOUND"){
            const pkg = this.deliveredPackages().find(p => p.id === event.packageId);
            if (pkg) {
                this.loadOnForklift(event.forkliftId, { ...pkg, status: 'IN_TRANSIT' });
            }
            this.deliveredPackages.update(pkgs =>
                pkgs.map(p => p.id === event.packageId
                    ? { ...p, status: 'IN_TRANSIT' }
                    : p
                )
            );
        }
        else if(event.taskType === "OUTBOUND"){
            const pkg = this.packages().find(p => p.id === event.packageId);
            if (!pkg) {
                return;
            }

            this.packages.update(pkgs => pkgs.filter(p => p.id !== event.packageId));

            this.sentPackages.update(pkgs => [...pkgs, { ...pkg, status: 'IN_TRANSIT' }]);
            this.loadOnForklift(event.forkliftId, { ...pkg, status: 'IN_TRANSIT' });
        }
    }

    handleAllocatedEvent(event: PackageAllocatedEvent) {
      const newPackage: PackageItemReadDto = {
        id: event.packageId,
        name: event.name,
        inboundOrderId: event.inboundOrderId,
        outboundOrderId: null,
        x: event.currentX,
        y: event.currentY,
        status: event.status, //should always be ALLOCATED here 
        layoutId: event.layoutId
      };
      this.deliveredPackages.update(prev => [...prev, newPackage]);
      this.allocationTargets.update(targets => new Map(targets).set(event.packageId, { x: event.targetX, y: event.targetY }));
    }

    handleDroppedEvent(event: PackageDroppedEvent) {
        this.sentPackages.update(pkgs =>
            pkgs.map(p => p.id === event.packageId
                ? { ...p, x: event.x, y: event.y, status: 'DROPPED' }
                : p
            )
        );
        this.releaseFromForklift(event.packageId);
    }

    getAllocationTarget(packageId: number): Coordinate | null {
        return this.allocationTargets().get(packageId) ?? null;
    }

    private loadOnForklift(forkliftId: number, pkg: PackageItemReadDto) {
        this.carriedByForklift.update(carried => new Map(carried).set(forkliftId, pkg));
    }

    private releaseFromForklift(packageId: number) {
        this.carriedByForklift.update(carried => {
            const next = new Map(carried);
            for (const [forkliftId, pkg] of carried) {
                if (pkg.id === packageId) {
                    next.delete(forkliftId);
                }
            }
            return next;
        });
    }
    
    private cordsToKey(x: number, y: number){
        return `${x}, ${y}`;
    }

    private keyToCords(key: string) : Coordinate{
        const cordsList = key.split(", ");
        return { x: Number(cordsList[0]), y: Number(cordsList[1])}
    }

    getByCoords(x: number, y: number) : PackageItemReadDto | null {
        return this.packagesByCoords().get(this.cordsToKey(x, y)) ?? null;
    }
}
