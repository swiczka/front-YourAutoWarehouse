import { computed, inject, Service, signal } from '@angular/core';
import { PackageItemReadDto } from '../dto/PackageItemReadDto';
import { PackageItemServiceApi } from '../api-services/package-item-service-api';
import { Coordinate } from '../helpers/grid.helpers';
import { InboundOrderDto } from '../dto/InboundOrderDto';
import { PackageAllocatedEvent, PackagePickedEvent, PackageStoredEvent } from '../events/PackageLocationEvent';

@Service()
export class PackageItemService {
   

    packages = signal<Map<string, PackageItemReadDto>>(new Map());

    deliveredPackages = signal<PackageItemReadDto[]>([]);

    readonly allocatedPackages = computed(() =>
        this.deliveredPackages().filter(pkg => pkg.status === 'ALLOCATED')
    );

    packageServiceApi = inject(PackageItemServiceApi);

    addPackagesOnLayoutInit(layoutId: number){
        this.packageServiceApi.getPackagesByLayoutId(layoutId).subscribe({
            next: (newPackages) => {
                const newCells = new Map<string, PackageItemReadDto>();
                newPackages.forEach(pkg => {
                    newCells.set(this.cordsToKey(pkg.x, pkg.y), pkg);
                });
                this.packages.set(newCells);
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

        this.packages.update(currentMap => new Map(currentMap).set(this.cordsToKey(event.x, event.y), storedPackage));
    }

    handlePickedEvent(event: PackagePickedEvent) {
        this.deliveredPackages.update(pkgs =>
            pkgs.map(p => p.id === event.packageId 
                ? { ...p, status: 'IN_TRANSIT' } 
                : p
            )
        );
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
    }
    
    private cordsToKey(x: number, y: number){
        return `${x}, ${y}`;
    }

    private keyToCords(key: string) : Coordinate{
        const cordsList = key.split(", ");
        return { x: Number(cordsList[0]), y: Number(cordsList[1])}
    }

    getByCoords(x: number, y: number) : PackageItemReadDto | null {
        const key = this.cordsToKey(x, y);
        const cell = this.packages().get(key);
        return cell ? cell : null;
    }
}
