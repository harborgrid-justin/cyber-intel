// 🟡 AGENT-3: Type Guards and Runtime Validation

export function isThreat(obj: any): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.value === 'string' &&
    typeof obj.severity === 'string'
  );
}

export function isCase(obj: any): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.priority === 'string'
  );
}

export function isThreatActor(obj: any): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.sophistication === 'string'
  );
}

export function validateApiResponse<T>(
  data: any,
  validator: (obj: any) => boolean
): T {
  if (!validator(data)) {
    throw new Error('API response validation failed');
  }
  return data as T;
}

export function validateArrayResponse<T>(
  data: any,
  validator: (obj: any) => boolean
): T[] {
  if (!Array.isArray(data)) {
    throw new Error('Expected array response');
  }
  
  data.forEach((item, index) => {
    if (!validator(item)) {
      throw new Error(`Array item at index ${index} failed validation`);
    }
  });
  
  return data as T[];
}
