
interface Page<T> {
  data: T[];
  nextCursor: string | null;
}

export class CursorPager {
  static paginate<T extends { id: string }>(
    allItems: T[], 
    limit: number, 
    cursor?: string
  ): Page<T> {
    let startIndex = 0;
    
    if (cursor) {
      const foundIndex = allItems.findIndex(i => i.id === cursor);
      if (foundIndex !== -1) {
        startIndex = foundIndex + 1;
      }
    }

    const data = allItems.slice(startIndex, startIndex + limit);
    const nextCursor = data.length > 0 && (startIndex + limit < allItems.length) 
      ? data[data.length - 1].id 
      : null;

    return { data, nextCursor };
  }
}
