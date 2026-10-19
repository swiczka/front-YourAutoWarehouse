import { Component, computed, inject, signal } from '@angular/core';
import { EditGridService } from '../../services/edit-grid-service';
import { LayoutStateService } from '../../services/layout-state-service';
import { GRID_CONFIG } from '../../config/grid.config';
import { Coordinate, countShelves, Direction, getCell } from '../../helpers/grid.helpers';
import { EditGridCell } from '../../mainarea/editgridcell/editgridcell';

const MIN_SIZE = 6;
const MAX_SIZE = 12;

// neighbour offsets: where the road cell sits relative to a free cell, and the direction it extends in
const NEIGHBOURS: { dx: number; dy: number; direction: Direction }[] = [
  { dx: 0, dy: -1, direction: Direction.UP },
  { dx: 0, dy: 1, direction: Direction.DOWN },
  { dx: -1, dy: 0, direction: Direction.RIGHT },
  { dx: 1, dy: 0, direction: Direction.LEFT },
];

const STEP: Record<Direction, Coordinate> = {
  [Direction.UP]: { x: 0, y: 1 },
  [Direction.DOWN]: { x: 0, y: -1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
};

// Drawing a new layout: road network on a small grid, saved as a new layout.
@Component({
  selector: 'app-layout-editor',
  imports: [EditGridCell],
  templateUrl: './layout-editor.html',
  styleUrl: './layout-editor.scss',
})
export class LayoutEditor {
  private editGridService = inject(EditGridService);
  private layoutState = inject(LayoutStateService);

  protected readonly minSize = MIN_SIZE;
  protected readonly maxSize = MAX_SIZE;
  protected readonly sizeX = this.layoutState.sizeX;
  protected readonly sizeY = this.layoutState.sizeY;
  protected readonly canCancel = computed(() => this.layoutState.previousLayoutId() !== null);

  // last drawn cell, for the grow animation
  private readonly lastAdded = signal<{ x: number; y: number; direction: Direction } | null>(null);

  protected readonly gridWidthPx = computed(() => this.sizeX() * GRID_CONFIG.editGridCellSizePx);
  protected readonly gridHeightPx = computed(() => this.sizeY() * GRID_CONFIG.editGridCellSizePx);

  protected readonly shelfCount = computed(() =>
    countShelves(this.editGridService.cells(), this.editGridService.sizeX(), this.editGridService.sizeY())
  );

  // every cell + what it can do: be extended into from a road, or play the grow animation
  protected readonly cells = computed(() => {
    const cells = this.editGridService.cells();
    const sizeX = this.editGridService.sizeX();
    const sizeY = this.editGridService.sizeY();
    const lastAdded = this.lastAdded();

    return cells.map(cell => {
      const { x, y } = cell.coordinate;
      let extendFrom: { origin: Coordinate; direction: Direction } | null = null;
      if (!cell.selected) {
        for (const neighbour of NEIGHBOURS) {
          const road = getCell(x + neighbour.dx, y + neighbour.dy, cells, sizeX, sizeY);
          if (road?.selected && road.allowedBranchings.includes(neighbour.direction)) {
            extendFrom = { origin: road.coordinate, direction: neighbour.direction };
            break;
          }
        }
      }
      const grown = lastAdded !== null && lastAdded.x === x && lastAdded.y === y;
      return {
        coordinate: cell.coordinate,
        selected: cell.selected,
        extendFrom,
        grownFrom: grown ? lastAdded.direction : null,
      };
    });
  });

  protected extend(request: { origin: Coordinate; direction: Direction }): void {
    this.editGridService.addCell(request.origin, request.direction);
    const step = STEP[request.direction];
    this.lastAdded.set({ x: request.origin.x + step.x, y: request.origin.y + step.y, direction: request.direction });
  }

  protected resize(deltaX: number, deltaY: number): void {
    const newX = Math.max(MIN_SIZE, Math.min(MAX_SIZE, this.sizeX() + deltaX));
    const newY = Math.max(MIN_SIZE, Math.min(MAX_SIZE, this.sizeY() + deltaY));
    this.sizeX.set(newX);
    this.sizeY.set(newY);
    this.lastAdded.set(null);
    this.editGridService.changeDimensions(newX, newY);
  }

  protected clearRoads(): void {
    this.lastAdded.set(null);
    this.editGridService.fillStarterCells(this.sizeX(), this.sizeY());
  }

  protected save(): void {
    this.layoutState.saveDrawnLayout();
  }

  protected cancel(): void {
    this.layoutState.cancelNewLayout();
  }
}
