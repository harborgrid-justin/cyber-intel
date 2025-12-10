
export class ParticleSystemSOA {
  private count: number;
  public x: Float32Array;
  public y: Float32Array;
  public vx: Float32Array;
  public vy: Float32Array;
  public active: Uint8Array;

  constructor(capacity: number) {
    this.count = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.active = new Uint8Array(capacity);
  }

  update(dt: number) {
    for (let i = 0; i < this.count; i++) {
      if (this.active[i]) {
        this.x[i] += this.vx[i] * dt;
        this.y[i] += this.vy[i] * dt;
      }
    }
  }
  
  activate(i: number, x: number, y: number) {
      if (i < this.count) {
          this.x[i] = x; this.y[i] = y;
          this.active[i] = 1;
      }
  }
}
