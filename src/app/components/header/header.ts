import { Component, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { LayoutStateService } from '../../services/layout-state-service';
import { ConnectionService } from '../../services/connection-service';
import { SettingsDialog } from '../settings-dialog/settings-dialog';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private layoutState = inject(LayoutStateService);
  private connection = inject(ConnectionService);
  private dialog = inject(Dialog);

  protected readonly online = this.connection.online;
  protected readonly layouts = this.layoutState.formattedLayouts;
  protected readonly layoutId = this.layoutState.layoutId;
  protected readonly drawingModeEnabled = this.layoutState.drawingModeEnabled;

  protected onLayoutChange(value: string): void {
    if (value === 'new') {
      this.layoutState.startNewLayout();
      return;
    }
    this.layoutState.selectLayout(Number(value));
  }

  protected startNewLayout(): void {
    this.layoutState.startNewLayout();
  }

  // CDK Dialog brings focus trapping, Escape to close and a backdrop
  protected openSettings(): void {
    this.dialog.open(SettingsDialog, {
      ariaLabelledBy: 'settings-title',
      backdropClass: 'yaw-backdrop',
    });
  }
}
