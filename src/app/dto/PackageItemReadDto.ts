export interface PackageItemReadDto {
    id: number;
    name: string;
    inboundOrderId: number;
    outboundOrderId: number | null;
    x: number;
    y: number;
    status: string;
    layoutId: number;
}