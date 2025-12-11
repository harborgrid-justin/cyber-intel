
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
  overrides: Record<string, any>;
  customCss: string;
  charts?: Record<string, any>;
  graph?: Record<string, any>;
}

export interface Permission {
  id: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}
