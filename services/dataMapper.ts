
export interface DataMapper<T> {
  toDomain(raw: any): T;
  toPersistence(domain: T): any;
}

export class IdentityMapper<T> implements DataMapper<T> {
  toDomain(raw: any): T { return raw as T; }
  toPersistence(domain: T): any { return domain; }
}

export class SnakeCaseMapper<T> implements DataMapper<T> {
  toDomain(raw: any): T {
    // Simple utility to convert keys if needed, placeholder for now
    // In a real app, use lodash.camelCase
    return raw as T; 
  }
  toPersistence(domain: T): any {
    // Placeholder for domain -> DB transformation
    return domain;
  }
}

export class NoSQLMapper<T extends { id: string }> implements DataMapper<T> {
  toDomain(raw: any): T {
    const { _id, ...rest } = raw;
    return { id: _id || raw.id, ...rest } as T;
  }
  toPersistence(domain: T): any {
    const { id, ...rest } = domain;
    return { _id: id, ...rest };
  }
}
