
interface DataPoint { t: number; v: number; }

export class PiecewiseConstant {
  static compress(data: DataPoint[], threshold: number): DataPoint[] {
    if (data.length === 0) return [];
    
    const result: DataPoint[] = [data[0]];
    let currentSegmentVal = data[0].v;

    for (let i = 1; i < data.length; i++) {
      const diff = Math.abs(data[i].v - currentSegmentVal);
      
      // If significant change, start new segment
      if (diff > threshold) {
        result.push(data[i]);
        currentSegmentVal = data[i].v;
      }
    }
    
    // Always include last point
    if (result[result.length - 1].t !== data[data.length - 1].t) {
        result.push(data[data.length - 1]);
    }
    
    return result;
  }
}
