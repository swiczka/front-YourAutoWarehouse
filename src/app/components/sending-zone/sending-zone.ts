import { Component, input, output } from '@angular/core';
import { PackageItemReadDto } from '../../dto/PackageItemReadDto';
import { PanelPopup } from '../ui/panel-popup/panel-popup';
import { getStatusView } from '../../helpers/status.helpers';

@Component({
  selector: 'app-sending-zone',
  imports: [PanelPopup],
  templateUrl: './sending-zone.html',
  styleUrl: './sending-zone.scss',
  host: {
    '[class.is-open]': 'open()',
  },
})
export class SendingZone {
  // packages sent during this browser session (memory only, gone after reload)
  packages = input.required<PackageItemReadDto[]>();
  // the parent keeps only one map popup open at a time
  open = input(false);
  toggle = output<void>();

  protected readonly statusView = getStatusView;
}
