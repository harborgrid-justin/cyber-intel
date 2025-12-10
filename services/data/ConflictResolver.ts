
interface VersionedEntity {
  id: string;
  version: number;
  updatedAt: number;
}

export class ConflictResolver {
  /**
   * Checks if the incoming change conflicts with the current state.
   * Throws error if incoming version is stale.
   */
  static check<T extends VersionedEntity>(current: T, incoming: T): void {
    if (incoming.version < current.version) {
      throw new Error(`Conflict Detected: Target version ${current.version} is ahead of incoming ${incoming.version}. Refresh required.`);
    }
  }

  /**
   * Merges two entities if versions match, incrementing version.
   */
  static resolve<T extends VersionedEntity>(current: T, changes: Partial<T>): T {
    return {
      ...current,
      ...changes,
      version: current.version + 1,
      updatedAt: Date.now()
    };
  }
}
