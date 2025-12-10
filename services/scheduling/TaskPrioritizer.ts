
export class TaskPrioritizer {
  static async run<T>(
    priority: 'user-blocking' | 'user-visible' | 'background',
    task: () => Promise<T> | T
  ): Promise<T> {
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      return (window as any).scheduler.postTask(task, { priority });
    }
    // Fallback
    if (priority === 'background') {
      return new Promise(resolve => setTimeout(() => resolve(task()), 0));
    }
    return task();
  }
}
