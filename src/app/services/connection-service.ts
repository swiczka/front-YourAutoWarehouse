import { inject, Service, signal } from '@angular/core';
import { RxStompState } from '@stomp/rx-stomp';
import { RxStompService } from '../stomp/rx-stomp.service';

// Live connection status of the WebSocket (STOMP) link to api-gateway.
// "online" turns false only after the connection really closes and back to true
// once it opens again - the short CONNECTING phases while retrying are ignored,
// so the offline banner does not flicker.
@Service()
export class ConnectionService {
  private stompService = inject(RxStompService);

  readonly online = signal(true);

  constructor() {
    this.stompService.connectionState$.subscribe((state) => {
      if (state === RxStompState.OPEN) {
        this.online.set(true);
      } else if (state === RxStompState.CLOSED) {
        this.online.set(false);
      }
    });
  }
}
