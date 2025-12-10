import { View, Severity } from './common';

export interface AppConfig {
  id: string; 
  appName: string;
  subtitle: string;
  version: string;
  threatLevel: string;
  orgName: string;
  primaryColor?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export interface NavigationItem {
  label: string;
  view: View;
  icon: string;
  perm: string;
  subModules?: string[];
}

export interface NavigationGroup {
  group: string;
  items: NavigationItem[];
}

export type NavigationConfig = NavigationGroup[];

export interface AIConfig {
  id: 'AI_CONFIG';
  modelName: string;
  systemInstruction: string;
  maxTokensBriefing: number;
}

export interface ScoringConfig {
  id: 'SCORING_CONFIG';
  weights: {
    severity: number;
    confidence: number;
    reputation: number;
  };
  severityValues: Record<Severity, number>;
}

export interface ThemeConfig {
  id: 'THEME_CONFIG';
  // Specific visual overrides mirroring the TOKENS structure
  overrides: Record<string, any>;
  // Raw CSS injection for granular control
  customCss: string;
  // Specific properties kept for backward compatibility or direct access by graphs
  charts?: { primary: string; grid: string; text: string; tooltipBg: string; tooltipBorder: string; tooltipText: string; axisColor?: string; gridOpacity?: string };
  graph?: {
    actorNode: string;
    threatCritical: string;
    threatHigh: string;
    threatMedium: string;
    link: string;
    text: string;
    particleSize?: string;
    linkOpacity?: string;
  };
}

export interface Permission {
  id: string;
  description: string;
  resource: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}
