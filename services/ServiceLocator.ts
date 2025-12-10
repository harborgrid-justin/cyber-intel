
type Constructor<T> = new (...args: any[]) => T;

class ServiceLocator {
  private services: Map<string, any> = new Map();

  register<T>(key: string, service: T) {
    this.services.set(key, service);
  }

  get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service '${key}' not registered`);
    }
    return service;
  }
  
  // Singleton helper
  registerSingleton<T>(key: string, Class: Constructor<T>) {
      if (!this.services.has(key)) {
          this.services.set(key, new Class());
      }
  }
}

export const locator = new ServiceLocator();
