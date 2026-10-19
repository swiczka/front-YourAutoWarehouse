export interface ForkliftData {
  id: number;
  x: number;
  y: number;
  // last horizontal driving direction - the icon is mirrored like a 2D game sprite
  facing: 'left' | 'right';
}