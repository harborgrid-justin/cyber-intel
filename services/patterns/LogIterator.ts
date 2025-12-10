
export interface IIterator<T> {
  current(): T | null;
  next(): T | null;
  hasNext(): boolean;
  reset(): void;
}

export class CollectionIterator<T> implements IIterator<T> {
  private collection: T[];
  private position: number = 0;

  constructor(collection: T[]) {
    this.collection = collection;
  }

  public current(): T | null {
    if (this.position < this.collection.length) {
        return this.collection[this.position];
    }
    return null;
  }

  public next(): T | null {
    const item = this.collection[this.position];
    this.position++;
    return item || null;
  }

  public hasNext(): boolean {
    return this.position < this.collection.length;
  }

  public reset(): void {
    this.position = 0;
  }
  
  public each(callback: (item: T) => void): void {
      while (this.hasNext()) {
          const item = this.next();
          if (item) callback(item);
      }
      this.reset();
  }
}
