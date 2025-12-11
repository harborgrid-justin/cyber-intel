
import { CONFIG } from '../../config';

export class BeaconService {
  static send(event: string, data: any) {
    const payload = new Blob([JSON.stringify({ event, data, ts: Date.now() })], {
      type: 'application/json',
    });
    
    // The Beacon API is designed to send data even after the page unloads
    const telemetryUrl = '/telemetry';
    const success = navigator.sendBeacon(telemetryUrl, payload);
    
    if (!success) {
      console.warn('Beacon failed, falling back to fetch (may fail on unload)');
      // Fallback
      fetch(telemetryUrl, {
          method: 'POST',
          body: payload,
          keepalive: true
      }).catch(() => {});
    }
  }
}
