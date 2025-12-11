
import { View } from '../types';

type Handler<T = any> = (data: T) => void;

class EventBus {
  private events: Record<string, Handler[]> = {};

  on<T>(event: string, handler: Handler<T>): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
    // Return an unsubscribe function
    return () => this.off(event, handler);
  }

  off<T>(event: string, handler: Handler<T>): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  emit<T>(event: string, data?: T): void {
    if (!this.events[event]) return;
    // Use a copy in case a handler unsubscribes during emit
    [...this.events[event]].forEach(handler => handler(data));
  }
}

export const bus = new EventBus();

// Typed Events for IntelliSense
export const EVENTS = {
  // System
  DATA_UPDATE: 'data:update',
  USER_UPDATE: 'data:user_update',
  CONFIG_UPDATE: 'data:config_update',
  THEME_UPDATE: 'data:theme_update',
  DB_ADAPTER_CHANGE: 'data:adapter_change',
  LOGOUT: 'auth:logout',

  // UI
  NAVIGATE: 'ui:navigate',
  NOTIFICATION: 'ui:notification',
  MODAL_OPEN: 'ui:modal_open',
  LOCK_SCREEN: 'ui:lock_screen',
  TOGGLE_THEME: 'ui:toggle_theme',
  
  // App-specific
  OPEN_CREATE_CASE: 'case:open_create'
};

// Define payload types for events
export type NavigationPayload = { view: View; id?: string; query?: string; [key: string]: any };

bus.on(EVENTS.NAVIGATE, (detail: NavigationPayload) => {
    // For compatibility with old window event listener during transition
    window.dispatchEvent(new CustomEvent('app-navigation', { detail }));
});
