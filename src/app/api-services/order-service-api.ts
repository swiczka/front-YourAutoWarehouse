import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { InboundOrderDto } from '../dto/InboundOrderDto';
import { InboundOrderReadDto } from '../dto/InboundOrderReadDto';

@Service()
export class OrderServiceApi {

    private http = inject(HttpClient);
    private readonly apiName = 'order';

    postInboundOrder(newOrder: InboundOrderDto) {
        return this.http.post(`/${this.apiName}/inbound`, newOrder);
    }

    getInboundOrders(layoutId: number){
        return this.http.get<InboundOrderReadDto[]>(`/${this.apiName}/inbound`);
        //TODO -- for now it returns all user orders, 
        // but in the future it should return only orders for the given layoutId
    }
}

