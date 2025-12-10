
export class SnapshotManager<T> {
  private snapshots: Map<number, string> = new Map();
  private maxSnapshots: number;

  constructor(maxSnapshots = 50) {
    this.maxSnapshots = maxSnapshots;
  }

  capture(version: number, state: T): void {
    if (this.snapshots.size >= this.maxSnapshots) {
      const oldest = Math.min(...this.snapshots.keys());
      this.snapshots.delete(oldest);
    }
    // Deep clone via serialization for isolation
    this.snapshots.set(version, JSON.stringify(state));
  }

  restore(version: number): T | null {
    const snap = this.snapshots.get(version);
    return snap ? JSON.parse(snap) : null;
  }

  getVersionHistory(): number[] {
    return Array.from(this.snapshots.keys()).sort((a, b) => a - b);
  }
}
