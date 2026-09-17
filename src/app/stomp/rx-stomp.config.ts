import { RxStompConfig } from '@stomp/rx-stomp';

export const myRxStompConfig: RxStompConfig = {
  // Which server?
  brokerURL: 'ws://127.0.0.1:8080/ws',

  beforeConnect: (client) => {
    let guestId = localStorage.getItem('browserId');
    if(!guestId){
        guestId = crypto.randomUUID();
        localStorage.setItem('browserId', guestId);
    }

    client.configure({
      connectHeaders: {
        "X-Guest-Id": guestId
      }
    })
  },

  // Heartbeats (ms). Set 0 to disable.
  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,

  // Reconnect delay (ms). Set 0 to disable.
  reconnectDelay: 2000,

  // Console diagnostics (avoid in production)
  // debug: (msg: string): void => {
  //   console.log(new Date(), msg);
  // },
};