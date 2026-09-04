import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { InboundOrderDto } from '../dto/InboundOrderDto';

@Service()
export class OrderServiceApi {

    private http = inject(HttpClient);
    private readonly apiName = 'order';

    postInboundOrder(newOrder: InboundOrderDto) {
        return this.http.post(`/${this.apiName}/inbound`, newOrder);
    }
}

