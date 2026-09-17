import { GridCellData } from "../helpers/grid.helpers";

export interface LayoutDto {
    id: number;
    forkliftNumber: number;
    gridData: GridCellData[];
    createdAt?: string;
}