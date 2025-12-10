
// In a real app, these might come from an API or env vars
const DEFAULT_FLAGS = {
  'simulations': true,
  'ai_chat': true,
  'dark_mode_v2': false,
  'advanced_graph': true
};

type FlagKey = keyof typeof DEFAULT_FLAGS;

export class FeatureFlags {
  private static flags: Record<string, boolean> = { ...DEFAULT_FLAGS };

  static isEnabled(feature: string): boolean {
    return !!this.flags[feature];
  }

  static setFlag(feature: string, value: boolean) {
    this.flags[feature] = value;
  }
  
  static getAll() { return this.flags; }
}
