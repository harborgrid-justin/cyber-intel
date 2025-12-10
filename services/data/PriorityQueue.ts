
interface QueueItem<T> {
  priority: number;
  item: T;
}

export class PriorityQueue<T> {
  private items: QueueItem<T>[] = [];

  enqueue(item: T, priority: number) {
    this.items.push({ item, priority });
    this.items.sort((a, b) => b.priority - a.priority); // Descending
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  isEmpty() { return this.items.length === 0; }
}
