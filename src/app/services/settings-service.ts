import { Service, signal } from '@angular/core';

// View preferences of this browser session (edited later in the settings dialog).
@Service()
export class SettingsService {
  // debug mode: print x, y in every map cell
  readonly showCoordinates = signal(false);
}
