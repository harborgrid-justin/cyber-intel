
// Intrinsic State: Shared across many particles (Heavy data)
class ParticleModel {
  public color: string;
  public geometry: Float32Array; // Simulating heavy mesh data

  constructor(color: string) {
    this.color = color;
    this.geometry = new Float32Array(100).fill(1); // Mock heavy data
  }
}

// Extrinsic State: Unique to each particle (Light data)
interface ParticleState {
  x: number;
  y: number;
  z: number;
}

export class FlyweightFactory {
  private static models: Record<string, ParticleModel> = {};

  static getModel(color: string): ParticleModel {
    if (!this.models[color]) {
      this.models[color] = new ParticleModel(color);
    }
    return this.models[color];
  }

  static cleanup() {
    this.models = {};
  }
  
  static getCount() {
      return Object.keys(this.models).length;
  }
}
