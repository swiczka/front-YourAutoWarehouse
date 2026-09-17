import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { GridCellData } from '../helpers/grid.helpers';
import { LayoutDto } from '../dto/LayoutDto';
import { LayoutIdDto } from '../dto/LayoutIdDto';
@Service()
export class LayoutServiceApi {
    updateForkliftNumber(newForkliftNumber: number) {
      console.log(`updating forklift number: ${newForkliftNumber}`)
    }

    private http = inject(HttpClient);
    private readonly apiName = 'warehouse';

    postNewLayout(newLayout: Map<string, GridCellData>) {
        const layoutArray = Array.from(newLayout.entries())
                                .map(([key, value]) => ({ 
                                    coordinates: value.coordinates, 
                                    allowedDirections: Array.from(value.allowedDirections), 
                                    isRoad: value.isRoad,
                                    isShelf: value.isShelf })
                                );
        return this.http.post(`/${this.apiName}/layout`, layoutArray);
    }

    getLatestLayout(){
        return this.http.get<LayoutDto>(`/${this.apiName}/layout/latest`);
    }

    getUserLayoutIds(){
        return this.http.get<LayoutIdDto[]>(`/${this.apiName}/layouts`);
    }

    getLayoutById(id: number){
        return this.http.get<LayoutDto>(`/${this.apiName}/layout/${id}`);
    }
}
