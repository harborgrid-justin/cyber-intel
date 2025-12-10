
export class Hydrator {
  static hydrate<T>(schema: new () => T, data: any): T {
    const instance = new schema();
    
    Object.keys(data).forEach(key => {
      // Type safety checks could go here
      if (key === 'createdAt' || key === 'updatedAt') {
          (instance as any)[key] = new Date(data[key]);
      } else {
          (instance as any)[key] = data[key];
      }
    });
    
    return instance;
  }

  static hydrateArray<T>(schema: new () => T, dataArray: any[]): T[] {
    return dataArray.map(d => this.hydrate(schema, d));
  }
}
