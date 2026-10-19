import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { OrdersPanel } from '../components/orders-panel/orders-panel';
import { LayoutStateService } from '../services/layout-state-service';
import { HallHeader } from '../components/hall-header/hall-header';
import { WarehouseMap } from '../components/warehouse-map/warehouse-map';
import { EventFeed } from '../components/event-feed/event-feed';
import { LayoutEditor } from '../components/layout-editor/layout-editor';

// Page body: the layout editor while drawing, the control room otherwise.
@Component({
  selector: 'app-mainarea',
  imports: [OrdersPanel,
    HallHeader,
    WarehouseMap,
    EventFeed,
    LayoutEditor],
  templateUrl: './mainarea.html',
  styleUrl: './mainarea.scss',
})
export class Mainarea implements OnInit, OnDestroy{

  private layoutState = inject(LayoutStateService);

  // layout state lives in LayoutStateService (shared with the header)
  readonly layoutId = this.layoutState.layoutId;
  readonly drawingModeEnabled = this.layoutState.drawingModeEnabled;

  ngOnInit(): void {
    this.layoutState.init();
  }

  ngOnDestroy(): void {
    this.layoutState.destroy();
  }
}
