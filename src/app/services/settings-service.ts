import { Service, signal } from '@angular/core';

// View preferences of this browser session (edited later in the settings dialog).
@Service()
export class SettingsService {
  // debug mode: print x, y in every map cell
  readonly showCoordinates = signal(false);
  // forklift.location-updated arrives every 0.5 s per forklift and can flood the event feed
  readonly showForkliftLocationsInFeed = signal(true);
}
