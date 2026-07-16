import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-mainarea',
  imports: [],
  templateUrl: './mainarea.html',
  styleUrl: './mainarea.scss',
})
export class Mainarea {
  sizeX = signal(10);
  sizeY = signal(10);

  minSize : number= 8;
  maxSize : number= 16;

  gridWidthPx = computed(() => this.sizeX() * 50);
  gridHeightPx = computed(() => this.sizeY() * 50);

  getCorrectSize(size: number) {
    return Math.max(this.minSize, Math.min(this.maxSize, size));
  }
}
