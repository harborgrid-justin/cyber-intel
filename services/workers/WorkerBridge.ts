
// A pipe to connect two workers directly or main thread privately
export class WorkerBridge {
  private port1: MessagePort;
  private port2: MessagePort;

  constructor() {
    const channel = new MessageChannel();
    this.port1 = channel.port1;
    this.port2 = channel.port2;
  }

  getReceiverPort() { return this.port2; }
  getSenderPort() { return this.port1; }

  connectTo(worker: Worker) {
    // Transfer port2 to the worker
    worker.postMessage({ command: 'CONNECT_BRIDGE', port: this.port2 }, [this.port2]);
  }
}
