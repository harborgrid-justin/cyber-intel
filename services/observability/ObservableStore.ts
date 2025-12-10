
type Observer<T> = (data: T) => void;

export class ObservableStore<T> {
  private observers: Observer<T>[] = [];
  private state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  subscribe(observer: Observer<T>): () => void {
    this.observers.push(observer);
    // Return unsubscribe function
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  notify() {
    this.observers.forEach(observer => observer(this.state));
  }

  get(): T {
    return this.state;
  }

  set(newState: T) {
    this.state = newState;
    this.notify();
  }
  
  update(partial: Partial<T>) {
      this.state = { ...this.state, ...partial };
      this.notify();
  }
}
