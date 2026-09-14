import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { InboundOrderDto } from '../dto/InboundOrderDto';
import { InboundOrderReadDto } from '../dto/InboundOrderReadDto';
import { OutboundOrderDto } from '../dto/OutboundOrderDto';
import { OutboundOrderReadDto } from '../dto/OutboundOrderReadDto';

@Service()
export class OrderServiceApi {

    private http = inject(HttpClient);
    private readonly apiName = 'order';

    postInboundOrder(newOrder: InboundOrderDto) {
        return this.http.post(`/${this.apiName}/inbound`, newOrder);
    }

    getInboundOrders(layoutId: number){
        return this.http.get<InboundOrderReadDto[]>(`/${this.apiName}/layout/${layoutId}/inbound`);
    }

    postOutboundOrder(newOrder: OutboundOrderDto){
        return this.http.post(`/${this.apiName}/outbound`, newOrder);
    }

    
    getOutboundOrders(layoutId: number){
        return this.http.get<OutboundOrderReadDto[]>(`/${this.apiName}/layout/${layoutId}/outbound`);
    }
}

