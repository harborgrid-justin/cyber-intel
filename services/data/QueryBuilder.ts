
type FilterOp = 'eq' | 'neq' | 'gt' | 'lt' | 'contains';

interface Filter {
  field: string;
  op: FilterOp;
  value: any;
}

export class QueryBuilder<T> {
  private filters: Filter[] = [];
  private sortField?: keyof T;
  private sortDir: 'asc' | 'desc' = 'asc';

  where(field: keyof T, op: FilterOp, value: any) {
    this.filters.push({ field: String(field), op, value });
    return this;
  }

  orderBy(field: keyof T, dir: 'asc' | 'desc' = 'asc') {
    this.sortField = field;
    this.sortDir = dir;
    return this;
  }

  execute(data: T[]): T[] {
    let result = data.filter(item => {
      return this.filters.every(f => {
        const val = (item as any)[f.field];
        switch (f.op) {
          case 'eq': return val === f.value;
          case 'neq': return val !== f.value;
          case 'gt': return val > f.value;
          case 'lt': return val < f.value;
          case 'contains': return String(val).toLowerCase().includes(String(f.value).toLowerCase());
          default: return true;
        }
      });
    });

    if (this.sortField) {
      result.sort((a, b) => {
        const valA = (a as any)[this.sortField!];
        const valB = (b as any)[this.sortField!];
        if (valA < valB) return this.sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }
}
