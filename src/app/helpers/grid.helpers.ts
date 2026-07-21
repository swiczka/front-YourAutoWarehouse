export class Coordinate {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export enum Direction {
    UP, // 0
    DOWN, // 1
    LEFT, // 2
    RIGHT // 3
}