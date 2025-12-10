
interface Rect { x: number; y: number; w: number; h: number; }
interface Point { id: string; x: number; y: number; data: any; }

export class QuadTree {
  private points: Point[] = [];
  private children: QuadTree[] = [];
  private capacity = 4;
  private divided = false;

  constructor(private boundary: Rect) {}

  insert(p: Point): boolean {
    if (!this.contains(this.boundary, p)) return false;

    if (this.points.length < this.capacity) {
      this.points.push(p);
      return true;
    }

    if (!this.divided) this.subdivide();

    return (
      this.children[0].insert(p) ||
      this.children[1].insert(p) ||
      this.children[2].insert(p) ||
      this.children[3].insert(p)
    );
  }

  query(range: Rect, found: Point[] = []): Point[] {
    if (!this.intersects(this.boundary, range)) return found;

    for (const p of this.points) {
      if (this.contains(range, p)) found.push(p);
    }

    if (this.divided) {
      this.children.forEach(c => c.query(range, found));
    }
    return found;
  }

  private subdivide() {
    const { x, y, w, h } = this.boundary;
    const nw = { x, y, w: w/2, h: h/2 };
    const ne = { x: x + w/2, y, w: w/2, h: h/2 };
    const sw = { x, y: y + h/2, w: w/2, h: h/2 };
    const se = { x: x + w/2, y: y + h/2, w: w/2, h: h/2 };
    
    this.children = [new QuadTree(nw), new QuadTree(ne), new QuadTree(sw), new QuadTree(se)];
    this.divided = true;
  }

  private contains(r: Rect, p: Point) {
    return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  }

  private intersects(a: Rect, b: Rect) {
    return !(b.x > a.x + a.w || b.x + b.w < a.x || b.y > a.y + a.h || b.y + b.h < a.y);
  }
}
