
export interface DomainEvent {
  eventId: string;
  aggregateId: string;
  type: string;
  data: any;
  timestamp: number;
}

export class EventStore {
  private events: DomainEvent[] = [];

  append(aggregateId: string, type: string, data: any) {
    const event: DomainEvent = {
      eventId: crypto.randomUUID(),
      aggregateId,
      type,
      data,
      timestamp: Date.now()
    };
    this.events.push(event);
    return event;
  }

  getEvents(aggregateId: string): DomainEvent[] {
    return this.events
      .filter(e => e.aggregateId === aggregateId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  // Rebuild state from events
  project<T>(aggregateId: string, reducer: (state: T, event: DomainEvent) => T, initialState: T): T {
    const history = this.getEvents(aggregateId);
    return history.reduce(reducer, initialState);
  }
}
