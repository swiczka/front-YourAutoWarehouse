import { Component, inject, signal } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { SettingsService } from '../../services/settings-service';
import { LayoutStateService } from '../../services/layout-state-service';

const MIN_FORKLIFTS = 1;
const MAX_FORKLIFTS = 12;

// Modal opened from the header. Changes are drafts until "ZAPISZ".
@Component({
  selector: 'app-settings-dialog',
  imports: [],
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.scss',
})
export class SettingsDialog {
  private dialogRef = inject(DialogRef);
  private settings = inject(SettingsService);
  private layoutState = inject(LayoutStateService);

  protected readonly layoutId = this.layoutState.layoutId;
  protected readonly minForklifts = MIN_FORKLIFTS;
  protected readonly maxForklifts = MAX_FORKLIFTS;

  protected readonly forkliftCount = signal(this.layoutState.forkliftNumber());
  protected readonly showCoordinates = signal(this.settings.showCoordinates());
  protected readonly showForkliftLocations = signal(this.settings.showForkliftLocationsInFeed());

  protected changeForkliftCount(delta: number): void {
    this.setForkliftCount(this.forkliftCount() + delta);
  }

  // typed value: anything that is not a number falls back to the minimum
  protected setForkliftCountFromText(text: string): void {
    this.setForkliftCount(Number.parseInt(text, 10));
  }

  private setForkliftCount(value: number): void {
    const count = Number.isFinite(value) ? value : MIN_FORKLIFTS;
    this.forkliftCount.set(Math.max(MIN_FORKLIFTS, Math.min(MAX_FORKLIFTS, count)));
  }

  protected save(): void {
    this.settings.showCoordinates.set(this.showCoordinates());
    this.settings.showForkliftLocationsInFeed.set(this.showForkliftLocations());
    this.layoutState.updateForkliftNumber(this.forkliftCount());
    this.dialogRef.close();
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
