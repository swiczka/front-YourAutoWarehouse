import { inject, Service, signal } from '@angular/core';
import { PackageItemReadDto } from '../dto/PackageItemReadDto';
import { PackageItemServiceApi } from '../api-services/package-item-service-api';
import { Coordinate } from '../helpers/grid.helpers';
import { InboundOrderDto } from '../dto/InboundOrderDto';
import { PackageAllocatedEvent, PackagePickedEvent, PackageStoredEvent } from '../events/PackageLocationEvent';

@Service()
export class PackageItemService {
   

    packages = signal<Map<string, PackageItemReadDto>>(new Map());

    deliveredPackages = signal<PackageItemReadDto[]>([]);

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

    getDeliveredPackaged(){
      return this.deliveredPackages()
    }

    handleStoredEvent(event: PackageStoredEvent) {
    const curPackages = new Map<string, PackageItemReadDto>(this.packages());

    const pkg = Array.from(curPackages.values()).find(p => p.id === event.packageId);

    if (pkg) {
        curPackages.delete(this.cordsToKey(pkg.x, pkg.y));

        pkg.x = event.x;
        pkg.y = event.y;
        pkg.status = "STORED";

        curPackages.set(this.cordsToKey(event.x, event.y), pkg);

        this.packages.set(curPackages);
    }
    }

    handlePickedEvent(event: PackagePickedEvent) {
      this.deliveredPackages.update(packages => 
          packages.filter(pkg => pkg.id !== event.packageId)
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
        status: event.status,
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
