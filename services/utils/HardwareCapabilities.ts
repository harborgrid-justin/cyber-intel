
interface NavigatorWithMemory extends Navigator {
    deviceMemory?: number;
}

export class HardwareCapabilities {
  static getMemory(): number {
    // Returns approximate RAM in GB (e.g. 0.25, 0.5, 1, 2, 4, 8)
    const nav = navigator as NavigatorWithMemory;
    if (nav.deviceMemory) {
      return nav.deviceMemory;
    }
    return 4; // Default assumption for desktop
  }

  static getConcurrency(): number {
    return navigator.hardwareConcurrency || 4;
  }

  static isLowEndDevice(): boolean {
    return this.getMemory() < 4 || this.getConcurrency() < 4;
  }
}
