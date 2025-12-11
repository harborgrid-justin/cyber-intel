
import { ThemeConfig } from '../types';
import { TOKENS } from '../styles/theme';

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  id: 'THEME_CONFIG',
  overrides: {},
  customCss: '',
  charts: TOKENS.dark.charts,
  graph: TOKENS.dark.graph
};
