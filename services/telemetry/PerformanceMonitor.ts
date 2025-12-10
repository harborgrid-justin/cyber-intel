
export class PerformanceMonitor {
  static mark(name: string) {
    performance.mark(name);
  }

  static measure(name: string, startMark: string, endMark: string) {
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      const last = entries[entries.length - 1];
      console.debug(`[Perf] ${name}: ${last.duration.toFixed(2)}ms`);
      
      // Cleanup
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
    } catch (e) {
      console.warn('Performance measurement failed', e);
    }
  }
}
