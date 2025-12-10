
export class AclManager {
  static filter<T>(data: T[], userClearance: string): T[] {
    const levels = ['UNCLASSIFIED', 'CONFIDENTIAL', 'SECRET', 'TS', 'TS/SCI'];
    const userLevelIdx = levels.indexOf(userClearance);

    return data.filter(item => {
      const clearance = (item as any).clearance;
      if (!clearance) return true;
      const itemLevelIdx = levels.indexOf(clearance);
      return userLevelIdx >= itemLevelIdx;
    });
  }
}
