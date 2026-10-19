export interface Coordinate {
    x: number;
    y: number;
}

export interface GridCellData{
    coordinates: Coordinate
    allowedDirections: Set<Direction>,
    isRoad: boolean,
    isShelf: boolean
}

export interface CellData {
  coordinate: Coordinate;
  allowedBranchings: Direction[];
  selected: boolean;
}

// important - works only with full grid 
export function getCell(x: number, y: number, cells: CellData[], sizeX: number, sizeY: number) {
    if (x < 0 || x >= sizeX || y < 0 || y >= sizeY) {
        return undefined;
    }
    const index = y * sizeX + x;
    return cells[index];
}

// Preview of GridService.setLayout: every drawn cell becomes 2 x 2 map cells and every
// free map cell touching a road becomes a shelf. Returns how many shelves the layout gets.
export function countShelves(cells: CellData[], sizeX: number, sizeY: number): number {
    const isRoad = (mapX: number, mapY: number) =>
        getCell(Math.floor(mapX / 2), Math.floor(mapY / 2), cells, sizeX, sizeY)?.selected === true;

    let shelves = 0;
    for (let mapY = 0; mapY < sizeY * 2; mapY++) {
        for (let mapX = 0; mapX < sizeX * 2; mapX++) {
            if (isRoad(mapX, mapY)) {
                continue;
            }
            const touchesRoad = isRoad(mapX + 1, mapY) || isRoad(mapX - 1, mapY)
                || isRoad(mapX, mapY + 1) || isRoad(mapX, mapY - 1);
            if (touchesRoad) {
                shelves++;
            }
        }
    }
    return shelves;
}

export enum Direction {
    UP, // 0
    DOWN, // 1
    LEFT, // 2
    RIGHT // 3
}

export type Corner = 'lu' | 'lb' | 'ru' | 'rb';