
export class TelemetryService {
  private static instance: TelemetryService;
  private events: any[] = [];
  private flushInterval: any;

  // Private constructor ensures no direct instantiation
  private constructor() {
    this.flushInterval = setInterval(() => this.flush(), 30000);
  }

  static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public track(event: string, payload: any = {}) {
    this.events.push({ event, payload, timestamp: Date.now() });
    if (this.events.length > 50) this.flush(); // Batch size trigger
  }

  private flush() {
    if (this.events.length === 0) return;
    console.log(`[Telemetry] Flushing ${this.events.length} events to backend...`);
    // Mock API call
    this.events = [];
  }
}
