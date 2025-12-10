
export class Immutable {
  static freeze<T extends object>(obj: T): T {
    // Recursively freeze object
    Object.keys(obj).forEach(name => {
      const prop = (obj as any)[name];
      if (typeof prop === 'object' && prop !== null) {
        this.freeze(prop);
      }
    });
    return Object.freeze(obj);
  }

  /**
   * Returns a copy of the object with the change applied, 
   * preserving immutability of the original.
   */
  static set<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]): T {
    const copy = { ...obj };
    copy[key] = value;
    return this.freeze(copy as T);
  }
}