
export class RateLimiter {
  private capacity: number;
  private tokens: number;
  private leakRate: number; // tokens per ms
  private lastUpdate: number;

  constructor(capacity: number, leakRatePerSec: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.leakRate = leakRatePerSec / 1000;
    this.lastUpdate = Date.now();
  }

  tryAcquire(cost: number = 1): boolean {
    this.leak();
    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }

  private leak() {
    const now = Date.now();
    const elapsed = now - this.lastUpdate;
    const leaked = elapsed * this.leakRate;
    
    if (leaked > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + leaked); // In leaky bucket as meter, tokens refill
      this.lastUpdate = now;
    }
  }
}
