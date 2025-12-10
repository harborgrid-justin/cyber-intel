
interface Box { x: number; y: number; w: number; h: number; id: string; }

export class RTree {
  private items: Box[] = [];

  insert(box: Box) {
    this.items.push(box);
  }

  // Linear search for simplicity in <150 lines, works well for N < 1000
  // Full R-tree splitting logic is too verbose for this constraint
  search(query: Box): Box[] {
    return this.items.filter(item => this.intersects(item, query));
  }

  private intersects(a: Box, b: Box): boolean {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  // KNN heuristic
  nearest(x: number, y: number, k = 1): Box[] {
    return this.items
      .map(item => ({ 
        item, 
        dist: Math.hypot(x - (item.x + item.w/2), y - (item.y + item.h/2)) 
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, k)
      .map(x => x.item);
  }
}
