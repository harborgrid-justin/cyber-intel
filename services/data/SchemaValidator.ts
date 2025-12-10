
export class SchemaValidator {
  static validate<T>(data: any, schema: Record<keyof T, string>): boolean {
    for (const key in schema) {
      const type = schema[key];
      const val = data[key];
      
      if (type === 'array' && !Array.isArray(val)) return false;
      if (type !== 'array' && typeof val !== type) {
          // Allow optional if undefined? Strict for now.
          if (val !== undefined) return false; 
      }
    }
    return true;
  }
}
