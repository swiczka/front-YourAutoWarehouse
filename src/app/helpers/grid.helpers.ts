export interface Coordinate {
    x: number;
    y: number;
}

export interface GridCellData{
    coordinates: Coordinate
    allowedDirections: Set<Direction>,
    selected: boolean,
    isShelf: boolean
}

export interface CellData {
  coordinate: Coordinate;
  allowedBranchings: Direction[];
  selected: boolean;
}

export function getCell(x: number, y: number, cells: CellData[], sizeX: number, sizeY: number) {
    if (x < 0 || x >= sizeX || y < 0 || y >= sizeY) {
        return undefined;
    }
    const index = y * sizeX + x;
    return cells[index];
}

export enum Direction {
    UP, // 0
    DOWN, // 1
    LEFT, // 2
    RIGHT // 3
}

export type Corner = 'lu' | 'lb' | 'ru' | 'rb';