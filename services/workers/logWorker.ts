
// We use a Blob to create a worker URL on the fly, avoiding webpack/vite config headaches.
const workerCode = `
  self.onmessage = function(e) {
    const { logs, pattern } = e.data;
    const regex = new RegExp(pattern, 'i');
    
    // Heavy computation simulation
    const results = logs.filter(log => {
      // Burn some CPU cycles to simulate complex parsing
      for(let i=0; i<100; i++) Math.random();
      return regex.test(log.details) || regex.test(log.action);
    });

    self.postMessage(results);
  };
`;

export class LogWorkerService {
  private worker: Worker | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
    }
  }

  processLogs(logs: any[], pattern: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.worker) return resolve(logs); // Fallback

      this.worker.onmessage = (e) => resolve(e.data);
      this.worker.onerror = (e) => reject(e);
      
      this.worker.postMessage({ logs, pattern });
    });
  }

  terminate() {
    this.worker?.terminate();
  }
}

export const logWorker = new LogWorkerService();
