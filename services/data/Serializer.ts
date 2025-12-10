
export class Serializer {
  static serialize(obj: any): string {
    return JSON.stringify(obj, (key, value) => {
      if (value instanceof Map) {
        return { _type: 'Map', value: Array.from(value.entries()) };
      }
      if (value instanceof Set) {
        return { _type: 'Set', value: Array.from(value) };
      }
      return value;
    });
  }

  static deserialize(json: string): any {
    return JSON.parse(json, (key, value) => {
      if (value && value._type === 'Map') {
        return new Map(value.value);
      }
      if (value && value._type === 'Set') {
        return new Set(value.value);
      }
      return value;
    });
  }
}
