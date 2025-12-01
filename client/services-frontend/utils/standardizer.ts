
export class DataStandardizer {
  static generateId(prefix: string): string {
    return `${prefix.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  static toIsoDate(date?: string | Date | number): string {
    if (!date) return new Date().toISOString();
    try {
      const d = new Date(date);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  static ensureArray<T>(val: T[] | undefined | null): T[] {
    return Array.isArray(val) ? val : [];
  }

  static sanitizeString(val: string | undefined): string {
    if (!val) return '';
    return val.trim();
  }

  static normalizeEnum<T>(val: string, validValues: T[], defaultVal: T): T {
    return validValues.includes(val as any) ? (val as unknown as T) : defaultVal;
  }
}
