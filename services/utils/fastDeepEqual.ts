
export function fastDeepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false;

    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!fastDeepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;

    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      // Recursively check value equality using generic casting for safety within recursion
      if (!fastDeepEqual((a as any)[key], (b as any)[key])) return false;
    }

    return true;
  }

  return false;
}
