
interface Point { x: number; y: number }

export class VisualHash {
  /**
   * Generates a locality-sensitive hash from 2D coordinates (e.g., Attack Graph layout).
   * Used to identify if two attack patterns share similar geometry.
   */
  static compute(points: Point[], gridSize: number = 10): string {
    const normalized = this.normalize(points);
    const grid = new Set<string>();

    normalized.forEach(p => {
      const gx = Math.floor(p.x / gridSize);
      const gy = Math.floor(p.y / gridSize);
      grid.add(`${gx}:${gy}`);
    });

    return Array.from(grid).sort().join('|');
  }

  private static normalize(points: Point[]): Point[] {
    if (points.length === 0) return [];
    // Center centroid at 0,0
    const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
    const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
    return points.map(p => ({ x: p.x - cx, y: p.y - cy }));
  }

  static similarity(hashA: string, hashB: string): number {
    const setA = new Set(hashA.split('|'));
    const setB = new Set(hashB.split('|'));
    
    let intersection = 0;
    setA.forEach(k => { if (setB.has(k)) intersection++; });
    
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 1 : intersection / union; // Jaccard Index
  }
}
