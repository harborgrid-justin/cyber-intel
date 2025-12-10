
import { Result, ok, fail, AppError } from '../../types/result';

export class SystemGuard {
  private static readonly MAX_HEAP_THRESHOLD = 50 * 1024 * 1024; // 50MB Warning
  private static dependencies: Map<string, Set<string>> = new Map();

  static checkMemoryHealth(): Result<string> {
    if ((window.performance as any)?.memory) {
      const usedJSHeapSize = (window.performance as any).memory.usedJSHeapSize;
      if (usedJSHeapSize > this.MAX_HEAP_THRESHOLD) {
         return fail(new AppError('High Memory Usage Detected', 'SYSTEM', { used: usedJSHeapSize }));
      }
    }
    return ok('Memory Nominal');
  }

  static registerDependency(module: string, dependency: string): Result<void> {
    if (!this.dependencies.has(module)) {
      this.dependencies.set(module, new Set());
    }
    
    this.dependencies.get(module)!.add(dependency);

    if (this.detectCycle(module, new Set())) {
      return fail(new AppError(`Circular Dependency Detected: ${module} -> ${dependency}`, 'SYSTEM'));
    }

    return ok(undefined);
  }

  private static detectCycle(current: string, visited: Set<string>): boolean {
    if (visited.has(current)) return true;
    visited.add(current);

    const deps = this.dependencies.get(current);
    if (deps) {
      for (const dep of deps) {
        if (this.detectCycle(dep, new Set(visited))) return true;
      }
    }
    return false;
  }
}
