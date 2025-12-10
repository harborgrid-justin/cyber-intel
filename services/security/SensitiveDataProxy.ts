
/**
 * Wraps an object and masks sensitive fields (email, phone, ip)
 * unless the privileged 'reveal' method is triggered.
 */
export const createSecureProxy = <T extends object>(target: T, sensitiveFields: string[]) => {
  const handler: ProxyHandler<T> = {
    get(obj, prop, receiver) {
      const key = String(prop);
      
      // If authorized access is requested specifically
      if (key === '__reveal__') {
        return () => ({ ...obj });
      }

      const value = Reflect.get(obj, prop, receiver);

      if (sensitiveFields.includes(key) && typeof value === 'string') {
        // Mask logic
        if (key.includes('email')) return value.replace(/(.{2})(.*)(@.*)/, '$1***$3');
        if (key.includes('ip')) return '***.***.***.***';
        return '••••••••';
      }

      return value;
    }
  };

  return new Proxy(target, handler) as T & { __reveal__: () => T };
};
