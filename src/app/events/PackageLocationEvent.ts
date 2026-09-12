export interface PackageAllocatedEvent {
    packageId: number;
    layoutId: number;
    inboundOrderId: number;
    name: string;
    status: string;
    currentX: number;
    currentY: number;
    targetX: number;
    targetY: number;
}

export interface PackageStoredEvent {
    packageId: number;
    layoutId: number;
    x: number;
    y: number;
}

export interface PackagePickedEvent {
    packageId: number;
    forkliftId: number;
    layoutId: number
}

export type PackageSocketEvent = PackageAllocatedEvent | PackageStoredEvent | PackagePickedEvent;