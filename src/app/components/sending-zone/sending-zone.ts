import { Component, computed, input, signal } from '@angular/core';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sending-zone',
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './sending-zone.html',
  styleUrl: './sending-zone.scss',
  host: {
    '[class.has-packages]': 'hasPackages()',
    '(click)': 'togglePopup()',
  },
})
export class SendingZone {
  packages = input.required<PackageItemReadDto[]>();

  hasPackages = computed(() => this.packages().length > 0);
  isPopupOpen = signal(false);

  displayedColumns: string[] = ['id', 'name', 'status', 'orderId'];

  togglePopup() {
    if (this.hasPackages()) {
      this.isPopupOpen.update((open) => !open);
    }
  }

  closePopup(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isPopupOpen.set(false);
  }
}
