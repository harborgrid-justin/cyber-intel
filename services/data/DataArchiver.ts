
export class DataArchiver {
  static archive(data: any[], maxAgeMs: number): { active: any[], archived: any[] } {
    const now = Date.now();
    const active: any[] = [];
    const archived: any[] = [];

    data.forEach(item => {
      const ts = new Date(item.timestamp || item.date || item.created || 0).getTime();
      if (now - ts > maxAgeMs) {
        archived.push(item);
      } else {
        active.push(item);
      }
    });

    return { active, archived };
  }
}
