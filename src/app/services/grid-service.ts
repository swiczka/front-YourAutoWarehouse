import { input, Service, signal } from '@angular/core';
import { CellData, Coordinate, Corner, Direction, getCell, GridCellData } from '../helpers/grid.helpers';

const DIRECTIONS_CELL_UP : Record<Corner, Direction> = {
    "lu": Direction.DOWN,
    "lb": Direction.RIGHT,
    "rb": Direction.UP,
    "ru": Direction.UP
}

const DIRECTIONS_CELL_DOWN : Record<Corner, Direction> = {
    "lu": Direction.DOWN,
    "lb": Direction.DOWN,
    "rb": Direction.UP,
    "ru": Direction.LEFT
}

const DIRECTIONS_CELL_LEFT : Record<Corner, Direction> = {
    "lu": Direction.LEFT,
    "lb": Direction.RIGHT,
    "rb": Direction.UP,
    "ru": Direction.LEFT
}

const DIRECTIONS_CELL_RIGHT : Record<Corner, Direction> = {
    "lu": Direction.DOWN,
    "lb": Direction.RIGHT,
    "rb": Direction.RIGHT,
    "ru": Direction.LEFT
}

@Service()
export class GridService {
    sizeX = signal(14);
    sizeY = signal(14);

    cells = signal<Map<string, GridCellData>>(new Map());

    setLayout(editSizeX: number, editSizeY: number, cells: CellData[]){

        this.sizeX.set(editSizeX * 2);
        this.sizeY.set(editSizeY * 2);

        const allowedCellsDirections = this.getCellsWithAllowedDirections(editSizeX, editSizeY, cells);
        this.getNewGridWithDirections(allowedCellsDirections); //modifies content od this.cells map

        for(let y = 0; y < this.sizeY(); y++){
            for(let x = 0; x < this.sizeX(); x++){
                const coordsKey = this.getCoordKey({x: x, y: y});
                
                if(!this.cells().has(coordsKey)){ //checking if given coord is a path (already analyzed so any element in cells should be road)
                    //checking if there is any neighbouring path - if there is one - make it shelf
                    const topCell = this.cells().get(this.getCoordKey({x: x, y: y + 1}));
                    const downCell = this.cells().get(this.getCoordKey({x: x, y: y - 1}));
                    const leftCell = this.cells().get(this.getCoordKey({x: x - 1, y: y}));
                    const rightCell = this.cells().get(this.getCoordKey({x: x + 1, y: y}));

                    const shouldBeShelf = !!(topCell?.selected || downCell?.selected || leftCell?.selected || rightCell?.selected);
           
                    this.cells.update( map => {
                        return new Map(map).set(coordsKey, {
                            coordinates: {x, y},
                            allowedDirections: new Set(),
                            selected: false,
                            isShelf: shouldBeShelf
                        });
                    });
                }
            }
        }
        return 0;

    }

    private getCellsWithAllowedDirections(editSizeX: number, editSizeY: number, cells: CellData[]){

        const cellDirectionsMap = new Map<string, GridCellData>();

        for(let y = 0; y < editSizeX; y++){
            for(let x = 0; x < editSizeY; x++){
                const cell = getCell(x, y, cells, editSizeX, editSizeY);
                //checking if cell is selected - if it is - check allowed directions
                if(!cell || !cell?.selected){
                    continue;
                }
                const topCell = getCell(x, y + 1, cells, editSizeX, editSizeY);
                const downCell = getCell(x, y - 1, cells, editSizeX, editSizeY);
                const leftCell = getCell(x - 1, y, cells, editSizeX, editSizeY);
                const rightCell = getCell(x + 1, y, cells, editSizeX, editSizeY);

                const allowedDirections = new Set<Direction>;
                
                if(topCell?.selected){
                    allowedDirections.add(Direction.UP);
                }
                if(downCell?.selected){
                    allowedDirections.add(Direction.DOWN);
                }
                if(leftCell?.selected){
                    allowedDirections.add(Direction.LEFT);
                }
                if(rightCell?.selected){
                    allowedDirections.add(Direction.RIGHT);
                }
   
                cellDirectionsMap.set(this.getCoordKey(cell?.coordinate), {
                    coordinates: cell?.coordinate,
                    allowedDirections: allowedDirections,
                    selected: cell?.selected,
                    isShelf: false
                });
              
            }
        }
        return cellDirectionsMap;
    }

    canInsertShelfHere(x: number, y: number, sizeX: number, sizeY: number, cells: Map<string, GridCellData>) : boolean{
            if(x >= sizeX || x < 0 || y >= sizeY || y < 0 ){
                return false;
            }
            const analyzedCell = cells.get(this.getCoordKey({x: x, y: y}));
            if(!analyzedCell || (!analyzedCell?.selected && !analyzedCell?.isShelf)){
                return true;
            }
            return false;
        }

    private getNewGridWithDirections(cellDirectionsMap: Map<string, GridCellData>){
        for(let [coordKey, gridCellData] of cellDirectionsMap){
            const allowedLUDirections = new Set<Direction>;
            const allowedLBDirections = new Set<Direction>;
            const allowedRBDirections = new Set<Direction>;
            const allowedRUDirections = new Set<Direction>;

            if(gridCellData.allowedDirections.has(Direction.UP)){
                allowedLUDirections.add(DIRECTIONS_CELL_UP['lu']);
                allowedLBDirections.add(DIRECTIONS_CELL_UP['lb']);
                allowedRBDirections.add(DIRECTIONS_CELL_UP['rb']);
                allowedRUDirections.add(DIRECTIONS_CELL_UP['ru']);
            }
            if(gridCellData.allowedDirections.has(Direction.DOWN)){
                allowedLUDirections.add(DIRECTIONS_CELL_DOWN['lu']);
                allowedLBDirections.add(DIRECTIONS_CELL_DOWN['lb']);
                allowedRBDirections.add(DIRECTIONS_CELL_DOWN['rb']);
                allowedRUDirections.add(DIRECTIONS_CELL_DOWN['ru']);
            }
            if(gridCellData.allowedDirections.has(Direction.LEFT)){
                allowedLUDirections.add(DIRECTIONS_CELL_LEFT['lu']);
                allowedLBDirections.add(DIRECTIONS_CELL_LEFT['lb']);
                allowedRBDirections.add(DIRECTIONS_CELL_LEFT['rb']);
                allowedRUDirections.add(DIRECTIONS_CELL_LEFT['ru']);
            }
            if(gridCellData.allowedDirections.has(Direction.RIGHT)){
                allowedLUDirections.add(DIRECTIONS_CELL_RIGHT['lu']);
                allowedLBDirections.add(DIRECTIONS_CELL_RIGHT['lb']);
                allowedRBDirections.add(DIRECTIONS_CELL_RIGHT['rb']);
                allowedRUDirections.add(DIRECTIONS_CELL_RIGHT['ru']);
            }

            const luCoords = this.getNewCoords(this.getCoordFromKey(coordKey), 'lu');
            this.cells.update(map => new Map(map).set(this.getCoordKey(luCoords), {
                coordinates: luCoords,
                allowedDirections: allowedLUDirections,
                selected: gridCellData.selected,
                isShelf: false
            }));

            const lbCoords = this.getNewCoords(this.getCoordFromKey(coordKey), 'lb');
            this.cells.update(map => new Map(map).set(this.getCoordKey(lbCoords), {
                coordinates: lbCoords,
                allowedDirections: allowedLBDirections,
                selected: gridCellData.selected,
                isShelf: false
            }));

            const ruCoords = this.getNewCoords(this.getCoordFromKey(coordKey), 'ru');
            this.cells.update(map => new Map(map).set(this.getCoordKey(ruCoords), {
                coordinates: ruCoords,
                allowedDirections: allowedRUDirections,
                selected: gridCellData.selected,
                isShelf: false
            }));

            const rbCoords = this.getNewCoords(this.getCoordFromKey(coordKey), 'rb');
            this.cells.update(map => new Map(map).set(this.getCoordKey(rbCoords), {
                coordinates: rbCoords,
                allowedDirections: allowedRBDirections,
                selected: gridCellData.selected,
                isShelf: false
            }));
        }
        return;
    }

    private getCoordKey(coordinate: Coordinate): string{
        return `${coordinate.x}, ${coordinate.y}`
    }

    private getCoordFromKey(coordinate: string): Coordinate{
        const cordsList = coordinate.split(",");
        return { x: Number(cordsList[0]), y: Number(cordsList[1])}
    }

    private getNewCoords(coordinate: Coordinate, corner: Corner): Coordinate {
        switch(corner){
            case 'lu':
                return {x: 2*coordinate.x, y: 2*coordinate.y+1}
            case 'lb':
                return {x: 2*coordinate.x, y: 2*coordinate.y}
            case 'ru':
                return {x: 2*coordinate.x+1, y: 2*coordinate.y+1}
            case 'rb':
                return {x: 2*coordinate.x+1, y: 2*coordinate.y}
            default:
                return {x: -1, y: -1} //error
            
        }
    }

}
