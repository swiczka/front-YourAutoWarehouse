import { inject, Service, signal } from '@angular/core';
import { PackageItemReadDto } from '../dto/PackageItemReadDto';
import { PackageItemServiceApi } from '../api-services/package-item-service-api';
import { Coordinate } from '../helpers/grid.helpers';

@Service()
export class PackageItemService {
    cells = signal<Map<string, PackageItemReadDto>>(new Map());

    packageServiceApi = inject(PackageItemServiceApi);

    addPackagesOnLayoutInit(layoutId: number){
        this.packageServiceApi.getPackagesByLayoutId(layoutId).subscribe({
            next: (packages) => {
                const newCells = new Map<string, PackageItemReadDto>();
                packages.forEach(pkg => {
                    newCells.set(this.cordsToKey(pkg.x, pkg.y), pkg);
                });
                this.cells.set(newCells);
            },
            error: (error) => {
                console.error('Error fetching packages:', error);
            }
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
        const key = this.cordsToKey(x, y);
        const cell = this.cells().get(key);
        return cell ? cell : null;
    }
}
