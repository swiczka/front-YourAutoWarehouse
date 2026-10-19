import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { GridCellData } from '../helpers/grid.helpers';
import { LayoutDto } from '../dto/LayoutDto';
import { LayoutIdDto } from '../dto/LayoutIdDto';
@Service()
export class LayoutServiceApi {
    private http = inject(HttpClient);
    private readonly apiName = 'warehouse';

    // PATCH /warehouse/layout/{id}/forklift?forkliftNumber=N (backend accepts 1..12)
    updateForkliftNumber(layoutId: number, newForkliftNumber: number) {
        return this.http.patch<LayoutDto>(`/${this.apiName}/layout/${layoutId}/forklift`, null, {
            params: { forkliftNumber: newForkliftNumber }
        });
    }

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
