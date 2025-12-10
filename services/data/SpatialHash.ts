
export class SpatialHash {
  private cellSize: number;
  private grid: Map<string, string[]> = new Map();

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  insert(id: string, x: number, y: number): void {
    const key = this.getKey(x, y);
    if (!this.grid.has(key)) this.grid.set(key, []);
    this.grid.get(key)!.push(id);
  }

  query(x: number, y: number, range: number): string[] {
    const results: string[] = [];
    const minX = Math.floor((x - range) / this.cellSize);
    const maxX = Math.floor((x + range) / this.cellSize);
    const minY = Math.floor((y - range) / this.cellSize);
    const maxY = Math.floor((y + range) / this.cellSize);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const key = `${cx}:${cy}`;
        const items = this.grid.get(key);
        if (items) results.push(...items);
      }
    }
    return results;
  }

  private getKey(x: number, y: number): string {
    return `${Math.floor(x / this.cellSize)}:${Math.floor(y / this.cellSize)}`;
  }
}
