
type Task = () => void;

export class IdleScheduler {
  private static queue: Task[] = [];
  private static isRunning = false;

  static enqueue(task: Task) {
    this.queue.push(task);
    if (!this.isRunning) {
      this.isRunning = true;
      this.schedule();
    }
  }

  private static schedule() {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback((deadline: any) => {
        while (deadline.timeRemaining() > 0 && this.queue.length > 0) {
          const task = this.queue.shift();
          if (task) task();
        }
        
        if (this.queue.length > 0) {
          this.schedule();
        } else {
          this.isRunning = false;
        }
      });
    } else {
      // Fallback
      setTimeout(() => {
        const task = this.queue.shift();
        if (task) task();
        if (this.queue.length > 0) this.schedule();
        else this.isRunning = false;
      }, 50);
    }
  }
}
