import { Service, signal } from '@angular/core';
import { Coordinate, Direction } from '../helpers/grid.helpers';

export interface CellData {
  coordinate: Coordinate;
  allowedBranchings: Direction[];
  selected: boolean;
}

@Service()
export class GridService {
    
    cells = signal<CellData[]>([]);

    sizeX = signal(10);
    sizeY = signal(10);

    fillStarterCells(){
        const result: CellData[] = [];
        for (let y = 0; y < this.sizeY(); y++) {
            for (let x = 0; x < this.sizeX(); x++) {
                result.push({
                    coordinate: new Coordinate(x, y),
                    allowedBranchings: ((x == 0) && (y == 0)) ? [Direction.UP, Direction.RIGHT] : [],
                    selected: ((x == 0) && (y == 0)) ? true : false
                });
            }
        }
        this.cells.set(result);
    }

    addCell(origin: Coordinate, direction: Direction) {
        let cellToChange : CellData | undefined;

        if(direction === Direction.UP){
            cellToChange = this.getCell(origin.x, origin.y + 1);
        }
        else if(direction === Direction.DOWN){
            cellToChange = this.getCell(origin.x, origin.y - 1);
        }
        else if(direction === Direction.LEFT){
            cellToChange = this.getCell(origin.x - 1, origin.y);
        }
        else if(direction === Direction.RIGHT){
            cellToChange = this.getCell(origin.x + 1, origin.y);
        }

        if(cellToChange){
            this.cells.update(cells => {
                const targetIndex = cellToChange.coordinate.y * this.sizeX() + cellToChange.coordinate.x;
                cells[targetIndex] = { ...cellToChange, selected: true};
                return cells;
            });
            this.updateAllowedBranchings();
        }
    }

    updateAllowedBranchings() {
        this.cells.update( cells => {
            return cells.map( cell => {
                if(cell.selected){
                    return {
                        ...cell,
                        allowedBranchings: this.getAllowedBranchingForCell(cell)
                    };
                }
                return cell;
            });
        });
    }

    private getCell(x: number, y: number): CellData | undefined {
        if (x < 0 || x >= this.sizeX() || y < 0 || y >= this.sizeY()) {
            return undefined;
        }
        const index = y * this.sizeX() + x;
        return this.cells()[index];
    }

    getAllowedBranchingForCell(cell : CellData){
        const topCell : CellData | undefined = this.getCell(cell.coordinate.x, cell.coordinate.y + 1);
        const downCell : CellData | undefined = this.getCell(cell.coordinate.x, cell.coordinate.y - 1);
        const leftCell : CellData | undefined = this.getCell(cell.coordinate.x - 1, cell.coordinate.y);
        const rightCell : CellData | undefined = this.getCell(cell.coordinate.x + 1, cell.coordinate.y);

        const allowedDirections : Direction[] = [];

        if(topCell && !topCell.selected){
            const leftToTopCell : CellData | undefined = this.getCell(topCell.coordinate.x - 1, topCell.coordinate.y);
            const rightToTopCell : CellData | undefined = this.getCell(topCell.coordinate.x + 1, topCell.coordinate.y);
            if(!leftToTopCell?.selected && !rightToTopCell?.selected){
                allowedDirections.push(Direction.UP);
            }   
        } 
        if(downCell && !downCell.selected){
            const leftToDownCell : CellData | undefined = this.getCell(downCell.coordinate.x - 1, downCell.coordinate.y);
            const rightToDownCell : CellData | undefined = this.getCell(downCell.coordinate.x + 1, downCell.coordinate.y);
            if(!leftToDownCell?.selected && !rightToDownCell?.selected){
                allowedDirections.push(Direction.DOWN);
            }   
        } 
        if(leftCell && !leftCell.selected){
            const topToLeftCell : CellData | undefined = this.getCell(leftCell.coordinate.x, leftCell.coordinate.y + 1);
            const downToLeftCell : CellData | undefined = this.getCell(leftCell.coordinate.x, leftCell.coordinate.y - 1);
            if(!topToLeftCell?.selected && !downToLeftCell?.selected){
                allowedDirections.push(Direction.LEFT);
            }   
        } 
        if(rightCell  && !rightCell.selected){
            const topToRightCell : CellData | undefined = this.getCell(rightCell.coordinate.x, rightCell.coordinate.y + 1);
            const downToRightCell : CellData | undefined = this.getCell(rightCell.coordinate.x, rightCell.coordinate.y - 1);
            if(!topToRightCell?.selected && !downToRightCell?.selected){
                allowedDirections.push(Direction.RIGHT);
            }   
        } 

        return allowedDirections;
    }
}
