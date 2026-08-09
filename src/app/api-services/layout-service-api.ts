import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { GridCellData } from '../helpers/grid.helpers';

@Service()
export class LayoutServiceApi {
    private http = inject(HttpClient);
    private readonly apiName = 'warehouse';

    postNewLayout(newLayout: Map<string, GridCellData>){
        const layoutArray = Array.from(newLayout.entries())
                                .map(([key, value]) => ({ 
                                    coordinates: value.coordinates, 
                                    allowedDirections: Array.from(value.allowedDirections), 
                                    selected: value.selected, 
                                    isShelf: value.isShelf })
                                );
        this.http.post(`/${this.apiName}/new`, layoutArray).subscribe({
            next: (response) => {
                console.log('Layout saved successfully:', response);
            },
            error: (error) => {
                console.error('Error saving layout:', error);
            }
        });
    }
    

}
