import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { InboundOrderDto } from '../dto/InboundOrderDto';
import { PackageItemReadDto } from '../dto/PackageItemReadDto';

@Service()
export class PackageItemServiceApi {
    private http = inject(HttpClient);
    private readonly apiName = 'package';

    getPackagesForInboundOrder(orderId: number){
        return this.http.get<PackageItemReadDto[]>(`/${this.apiName}/inbound/${orderId}`);
    }

    getPackagesByLayoutId(layoutId: number){
        return this.http.get<PackageItemReadDto[]>(`/${this.apiName}/layout/${layoutId}`);
    }
}

