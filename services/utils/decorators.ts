
/**
 * Method Decorator to measure execution time of functions.
 * Usage: @MeasureTime on class methods.
 */
export function MeasureTime(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    
    // Check if result is a promise to measure async time correctly
    if (result instanceof Promise) {
        return result.then((res) => {
            console.debug(`[Perf] ${propertyKey} took ${(performance.now() - start).toFixed(2)}ms (Async)`);
            return res;
        });
    }

    console.debug(`[Perf] ${propertyKey} took ${(end - start).toFixed(2)}ms`);
    return result;
  };

  return descriptor;
}

/**
 * Decorator to log inputs
 */
export function LogInputs(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function(...args: any[]) {
        console.debug(`[Call] ${propertyKey}(${args.map(a => JSON.stringify(a)).join(', ')})`);
        return original.apply(this, args);
    };
    return descriptor;
}
