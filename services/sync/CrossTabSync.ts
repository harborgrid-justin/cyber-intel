
type SyncMessage = { type: 'LOGOUT' | 'THEME_CHANGE' | 'ALERT'; payload?: any };

export class CrossTabSync {
  private channel: BroadcastChannel;

  constructor(channelName: string = 'sentinel_sync') {
    this.channel = new BroadcastChannel(channelName);
  }

  send(msg: SyncMessage) {
    this.channel.postMessage(msg);
  }

  onMessage(callback: (msg: SyncMessage) => void) {
    this.channel.onmessage = (ev) => callback(ev.data);
  }

  close() {
    this.channel.close();
  }
}

export const tabSync = new CrossTabSync();
