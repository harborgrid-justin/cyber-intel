
// The Memento object containing state
export class Memento<T> {
  constructor(private state: string) {}

  getState(): T {
    return JSON.parse(this.state);
  }
}

// The Originator that creates/restores mementos
export class StateOriginator<T> {
  private state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  public setState(state: T) {
    this.state = state;
  }

  public getState(): T {
    return this.state;
  }

  public save(): Memento<T> {
    return new Memento(JSON.stringify(this.state));
  }

  public restore(memento: Memento<T>) {
    this.state = memento.getState();
  }
}

// The Caretaker that manages history
export class Caretaker<T> {
  private mementos: Memento<T>[] = [];
  private originator: StateOriginator<T>;

  constructor(originator: StateOriginator<T>) {
    this.originator = originator;
  }

  public backup() {
    this.mementos.push(this.originator.save());
  }

  public undo() {
    if (!this.mementos.length) return;
    const memento = this.mementos.pop();
    if (memento) {
        this.originator.restore(memento);
    }
  }
}
