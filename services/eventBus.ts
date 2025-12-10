
type Handler<T = any> = (data: T) => void;

class EventBus {
  private events: Record<string, Handler[]> = {};

  on<T>(event: string, handler: Handler<T>): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  off<T>(event: string, handler: Handler<T>): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  emit<T>(event: string, data?: T): void {
    if (!this.events[event]) return;
    this.events[event].forEach(handler => handler(data));
  }
}

export const bus = new EventBus();

// Typed Events for IntelliSense
export const EVENTS = {
  THREAT_UPDATE: 'threat:update',
  NOTIFICATION: 'ui:notification',
  MODAL_OPEN: 'ui:modal_open',
  THEME_CHANGE: 'sys:theme_change',
  WORKER_MESSAGE: 'sys:worker_msg'
};
