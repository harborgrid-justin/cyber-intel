
import { threatData } from './dataLayer';
import { Severity, IncidentStatus, ThreatId } from '../types';

export class SocketService {
  private static instance: SocketService;
  private interval: any;

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new SocketService();
    }
    return this.instance;
  }

  connect() {
    // Simulate incoming socket events
    this.interval = setInterval(() => {
      if (Math.random() > 0.95) {
        // Random Alert
        const id = `LIVE-${Date.now()}` as ThreatId;
        const alert = {
          id,
          indicator: `10.200.1.${Math.floor(Math.random() * 255)}`,
          type: 'IP Address',
          severity: Severity.HIGH,
          lastSeen: 'Now',
          source: 'IDS-Realtime',
          description: 'Lateral Movement Detected',
          status: IncidentStatus.NEW,
          confidence: 85,
          region: 'Internal',
          threatActor: 'Unknown',
          reputation: 10,
          score: 88
        };
        
        threatData.addThreat(alert);
        window.dispatchEvent(new CustomEvent('notification', { 
          detail: { title: 'IDS Alert', message: `Lateral movement detected from ${alert.indicator}`, type: 'critical' } 
        }));
      }
    }, 10000);
  }

  disconnect() {
    clearInterval(this.interval);
  }
}
