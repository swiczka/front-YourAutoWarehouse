import { Component, input, output } from '@angular/core';

// Shared frame of every popup on the map: title bar with a close button,
// content projected below (<ng-content>). Positioning is up to the parent.
@Component({
  selector: 'app-panel-popup',
  imports: [],
  templateUrl: './panel-popup.html',
  styleUrl: './panel-popup.scss',
  host: {
    'class': 'yaw-popup',
    'role': 'dialog',
    '[attr.aria-label]': 'title()',
    // clicks inside must not reach the zone/cell that opened the popup
    '(click)': '$event.stopPropagation()',
  },
})
export class PanelPopup {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly close = output<void>();
}
