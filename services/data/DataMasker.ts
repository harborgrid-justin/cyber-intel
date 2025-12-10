
export class DataMasker {
  static mask(data: any, sensitiveFields: string[]): any {
    if (typeof data !== 'object' || data === null) return data;
    
    if (Array.isArray(data)) {
      return data.map(item => this.mask(item, sensitiveFields));
    }

    const masked = { ...data };
    for (const key of sensitiveFields) {
      if (key in masked && typeof masked[key] === 'string') {
        masked[key] = '********';
      }
    }
    return masked;
  }
}
