
export type ThemeMode = 'light' | 'dark';

// Base Primitive Colors (Tailwind Reference)
const palette = {
  slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
  blue: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a', 950: '#172554' },
  green: { 400: '#4ade80', 500: '#22c55e', 700: '#15803d', 900: '#14532d', 950: '#052e16' },
  emerald: { 400: '#34d399', 500: '#10b981', 900: '#064e3b', 950: '#022c22' },
  amber: { 400: '#fbbf24', 500: '#f59e0b', 900: '#78350f', 950: '#451a03' },
  orange: { 400: '#fb923c', 500: '#f97316', 900: '#7c2d12', 950: '#431407' },
  red: { 400: '#f87171', 500: '#ef4444', 900: '#7f1d1d', 950: '#450a0a' },
  rose: { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 900: '#881337', 950: '#4c0519' },
  purple: { 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 900: '#581c87', 950: '#3b0764' },
  cyan: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 900: '#164e63', 950: '#083344' },
  yellow: { 400: '#facc15', 500: '#eab308', 900: '#713f12', 950: '#422006' },
};

const commonTokens = {
  zIndex: { base: '0', dropdown: '40', sticky: '30', header: '50', orbital: '60', modalBackdrop: '4999', modal: '5000', toast: '6000', tooltip: '7000', },
  
  // Spacing Scale
  spacing: {
    none: '0',
    xxs: '0.25rem',
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
    card: '1.5rem',
    input: '0.75rem'
  },

  // Font Size Scale
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
    xxxl: '1.875rem',
    xxxxl: '2.25rem'
  },

  // Advanced Typography Scale
  typography: {
    fontFamily: {
        sans: "'Inter', system-ui, -apple-system, sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
        display: "'Orbitron', sans-serif"
    },
    h1: { size: '1.875rem', weight: '700', spacing: '-0.025em', height: '1.2' },
    h2: { size: '1.5rem', weight: '700', spacing: '-0.025em', height: '1.3' },
    h3: { size: '1.25rem', weight: '600', spacing: '0', height: '1.4' },
    body: { size: '0.875rem', weight: '400', height: '1.5', spacing: '0' },
    small: { size: '0.75rem', weight: '500', height: '1.4', spacing: '0.025em' },
    tiny: { size: '0.625rem', weight: '600', height: '1', spacing: '0.05em' },
    code: { size: '0.75rem', weight: '400', height: '1.6' }
  },

  // Component Physics & Geometry
  components: {
      button: {
          heightSmall: '28px',
          heightMedium: '36px',
          heightLarge: '44px',
          radius: '0.375rem',
          paddingX: '1rem',
          focusRingWidth: '2px',
          fontWeight: '600',
          textTransform: 'uppercase'
      },
      input: {
          height: '36px',
          radius: '0.375rem',
          paddingX: '0.75rem',
          fontSize: '0.875rem',
          borderWidth: '1px'
      },
      card: {
          radius: '0.75rem',
          padding: '1.5rem',
          borderWidth: '1px',
          headerHeight: '3.5rem'
      },
      modal: {
          radius: '1rem',
          overlayOpacity: '0.7',
          backdropBlur: '4px',
          shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      },
      badge: {
          radius: '9999px',
          paddingX: '0.5rem',
          paddingY: '0.125rem',
          fontWeight: '700',
          fontSize: '0.625rem'
      },
      table: {
          rowHeight: '3rem',
          headerHeight: '2.5rem',
          fontSize: '0.75rem',
          cellPaddingX: '1.5rem'
      }
  },

  // Animation Dynamics
  animation: {
    duration: { fast: '100ms', normal: '200ms', slow: '500ms' },
    easing: { default: 'ease-out', bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    pulse: '2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  }
};

// Legacy color definitions for backward compatibility with initial Phase 1/2 components
// These are merged into the main `colors` object
const legacyDarkColors = {
      success: palette.emerald[400], successDim: 'rgba(16, 185, 129, 0.1)',
      warning: palette.amber[400], warningDim: 'rgba(245, 158, 11, 0.1)',
      error: palette.rose[500], errorDim: 'rgba(244, 63, 94, 0.1)',
      info: palette.blue[400], infoDim: 'rgba(96, 165, 250, 0.1)',
      critical: palette.rose[400], criticalDim: 'rgba(251, 113, 133, 0.1)',
      high: palette.orange[400], highDim: 'rgba(251, 146, 60, 0.1)',
      medium: palette.yellow[400], mediumDim: 'rgba(250, 204, 21, 0.1)',
      low: palette.blue[400], lowDim: 'rgba(96, 165, 250, 0.1)',
      borderDefault: 'rgba(255, 255, 255, 0.08)',
      borderSubtle: 'rgba(255, 255, 255, 0.04)',
      borderHighlight: 'rgba(6, 182, 212, 0.3)',
      borderFocus: palette.cyan[500],
      surfaceDefault: 'rgba(15, 23, 42, 0.65)',
      surfaceRaised: 'rgba(30, 41, 59, 0.70)',
      surfaceHighlight: 'rgba(30, 41, 59, 0.8)',
      surfaceSubtle: 'rgba(15, 23, 42, 0.40)',
      textPrimary: palette.slate[50],
      textSecondary: palette.slate[400],
      textTertiary: palette.slate[500],
      appBg: '#030712',
      inputPlaceholder: palette.slate[600]
};

const legacyLightColors = {
      success: palette.emerald[500], successDim: 'rgba(16, 185, 129, 0.1)',
      warning: palette.amber[500], warningDim: 'rgba(245, 158, 11, 0.1)',
      error: palette.rose[600], errorDim: 'rgba(244, 63, 94, 0.1)',
      info: palette.blue[500], infoDim: 'rgba(96, 165, 250, 0.1)',
      critical: palette.rose[500], criticalDim: 'rgba(251, 113, 133, 0.1)',
      high: palette.orange[500], highDim: 'rgba(251, 146, 60, 0.1)',
      medium: palette.yellow[500], mediumDim: 'rgba(250, 204, 21, 0.1)',
      low: palette.blue[500], lowDim: 'rgba(96, 165, 250, 0.1)',
      borderDefault: palette.slate[200],
      borderSubtle: palette.slate[100],
      borderHighlight: palette.cyan[500],
      borderFocus: palette.cyan[600],
      surfaceDefault: '#ffffff',
      surfaceRaised: '#f1f5f9',
      surfaceHighlight: '#e2e8f0',
      surfaceSubtle: '#f8fafc',
      textPrimary: palette.slate[900],
      textSecondary: palette.slate[600],
      textTertiary: palette.slate[500],
      appBg: '#f0f4f8',
      inputPlaceholder: palette.slate[400]
};

const darkTheme = {
  ...commonTokens,
  colors: {
    // Mix in legacy flat tokens for backward compat
    ...legacyDarkColors,

    // Brand & Actions
    primary: palette.cyan[500], primaryDim: 'rgba(6, 182, 212, 0.1)',
    brand: palette.blue[600], brandDim: 'rgba(37, 99, 235, 0.1)',
    accent: palette.purple[400], accentDim: 'rgba(192, 132, 252, 0.1)',
    
    // Semantic States (Nested for Phase 3 components)
    state: {
        success: palette.emerald[400],
        warning: palette.amber[400],
        error: palette.rose[500],
        info: palette.blue[400],
        online: '#10b981',
        offline: '#64748b',
        busy: '#ef4444',
        away: '#f59e0b'
    },
    
    // Risk Levels (SCRM/Threats)
    risk: {
        critical: palette.rose[400],
        high: palette.orange[400],
        medium: palette.yellow[400],
        low: palette.blue[400],
        safe: palette.green[400]
    },

    // UI Surfaces
    surface: {
        default: 'rgba(15, 23, 42, 0.65)',
        raised: 'rgba(30, 41, 59, 0.70)',
        subtle: 'rgba(15, 23, 42, 0.40)',
        highlight: 'rgba(30, 41, 59, 0.8)',
        modal: '#020617',
        popover: '#0f172a'
    },

    // Borders & Lines
    border: {
        default: 'rgba(255, 255, 255, 0.08)',
        subtle: 'rgba(255, 255, 255, 0.04)',
        highlight: 'rgba(6, 182, 212, 0.3)',
        focus: palette.cyan[500]
    },

    // Text Content
    text: {
        primary: palette.slate[50],
        secondary: palette.slate[400],
        tertiary: palette.slate[500],
        muted: palette.slate[600],
        inverse: palette.slate[950],
        link: palette.cyan[400],
        linkHover: palette.cyan[300]
    },

    // Glassmorphism System
    glass: {
        blur: '12px',
        saturation: '180%',
        border: 'rgba(255, 255, 255, 0.08)',
        bg: 'rgba(15, 23, 42, 0.7)'
    }
  },

  shadows: {
    glowPrimary: '0 0 15px rgba(6, 182, 212, 0.4)',
    glowBrand: '0 0 15px rgba(37, 99, 235, 0.4)',
    glowCritical: '0 0 15px rgba(251, 113, 133, 0.3)',
    glowHigh: '0 0 15px rgba(251, 146, 60, 0.3)',
    glowMedium: '0 0 15px rgba(250, 204, 21, 0.3)',
    glowLow: '0 0 15px rgba(96, 165, 250, 0.3)',
    glowSuccess: '0 0 8px rgba(16, 185, 129, 0.4)',
    glowWarning: '0 0 8px rgba(245, 158, 11, 0.4)',
    glowError: '0 0 8px rgba(244, 63, 94, 0.4)',
    glowInfo: '0 0 8px rgba(96, 165, 250, 0.4)',
    glowAccent: '0 0 8px rgba(192, 132, 252, 0.4)',
  },
  app: {
    backgroundImage: `radial-gradient(circle at 15% 50%, rgba(30, 58, 138, 0.12) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(136, 19, 55, 0.08) 0%, transparent 25%), radial-gradient(circle at 50% 0%, rgba(15, 23, 42, 0.5) 0%, transparent 50%)`,
    scrollbarThumb: 'rgba(255, 255, 255, 0.1)', scrollbarThumbHover: 'rgba(255, 255, 255, 0.2)',
  },
  charts: {
    primary: palette.cyan[500], grid: palette.slate[800], text: palette.slate[500],
    tooltipBg: palette.slate[900], tooltipBorder: palette.slate[700], tooltipText: palette.slate[300],
    axisColor: palette.slate[600], gridOpacity: '0.1'
  },
  graph: {
    actorNode: palette.rose[500], threatCritical: palette.rose[500], threatHigh: palette.orange[500],
    threatMedium: palette.yellow[500], link: palette.slate[600], text: palette.slate[300],
    particleSize: '2', linkOpacity: '0.2'
  },
  terminal: {
    bg: '#0c0c0c', header: '#1a1a1a', border: '#2a2a2a', text: palette.green[400],
    error: palette.red[400], warn: palette.orange[400], info: palette.cyan[400]
  }
};

const lightTheme = { 
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    // Mix in legacy flat tokens for light mode
    ...legacyLightColors,
    
    // Updated nested tokens for light mode
    surface: { ...darkTheme.colors.surface, default: '#ffffff', raised: '#f1f5f9', highlight: '#e2e8f0' },
    text: { ...darkTheme.colors.text, primary: palette.slate[900], secondary: palette.slate[600], tertiary: palette.slate[500] },
    border: { ...darkTheme.colors.border, default: palette.slate[200], subtle: palette.slate[100] }
  },
  app: {
     backgroundImage: 'none',
     scrollbarThumb: palette.slate[300], scrollbarThumbHover: palette.slate[400],
  }
};

export const TOKENS = { ...commonTokens, dark: darkTheme, light: lightTheme };

// Centralized Styles (Consumed by Components)
// Updated to use the new token structure where possible, mapped back to CSS vars generated by ThemeEngine
export const STYLES = {
  app_container: `h-screen w-screen flex flex-col overflow-hidden bg-[var(--colors-appBg)] text-[var(--colors-textPrimary)] text-[var(--fontSizes-base)] font-sans`,
  page_container: 'flex-1 flex flex-col overflow-hidden relative',
  page_padding: 'p-[var(--spacing-md)] sm:p-[var(--spacing-lg)] lg:p-[var(--spacing-xl)]',
  
  panel: `bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)]`,
  
  input: `bg-[var(--colors-surfaceHighlight)] border border-[var(--colors-borderDefault)] rounded-[var(--components-input-radius)] focus:outline-none focus:ring-1 focus:ring-[var(--colors-borderFocus)] focus:border-[var(--colors-borderFocus)] px-[var(--components-input-paddingX)] h-[var(--components-input-height)] text-[var(--typography-body-size)] text-[var(--colors-textPrimary)] placeholder-[var(--colors-inputPlaceholder)] transition-all`,
  
  button: {
    base: 'inline-flex items-center justify-center rounded-[var(--components-button-radius)] transition-all duration-[var(--animation-duration-fast)] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--colors-appBg)] disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed select-none font-[var(--components-button-fontWeight)] tracking-wide',
    primary: 'bg-[var(--colors-primary)] text-white hover:brightness-110 focus:ring-[var(--colors-primary)] shadow-[var(--shadows-glowPrimary)]',
    secondary: 'bg-[var(--colors-surfaceHighlight)] text-[var(--colors-textPrimary)] hover:bg-[var(--colors-surfaceRaised)] border border-[var(--colors-borderDefault)] focus:ring-[var(--colors-textSecondary)]',
    danger: 'bg-[var(--colors-error)] text-white hover:bg-[var(--colors-error)]/90 focus:ring-[var(--colors-error)] shadow-[var(--shadows-glowError)]',
    ghost: 'bg-transparent text-[var(--colors-textSecondary)] hover:text-[var(--colors-textPrimary)] hover:bg-[var(--colors-surfaceHighlight)]',
    outline: 'bg-transparent border border-[var(--colors-borderDefault)] text-[var(--colors-textSecondary)] hover:bg-[var(--colors-surfaceHighlight)] hover:text-[var(--colors-textPrimary)] hover:border-[var(--colors-textSecondary)]',
  },
  
  card: `bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-[var(--components-card-radius)] backdrop-blur-[var(--colors-glass-blur)]`,
  card_interactive: `bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-[var(--components-card-radius)] cursor-pointer hover:bg-[var(--colors-surfaceHighlight)] hover:border-[var(--colors-borderHighlight)] transition-all duration-[var(--animation-duration-normal)]`,
  
  badge: 'text-[var(--components-badge-fontSize)] font-bold px-[var(--components-badge-paddingX)] py-[var(--components-badge-paddingY)] rounded-[var(--components-badge-radius)] inline-flex items-center justify-center',
};

// Backwards compatibility shim
export const EXECUTIVE_THEME = {
    surfaces: {
        app_container: STYLES.app_container,
        card_base: STYLES.card,
        input_field: STYLES.input,
    },
    typography: {
        h1: `text-[var(--typography-h1-size)] font-bold text-[var(--colors-textPrimary)] tracking-[var(--typography-h1-spacing)] leading-[var(--typography-h1-height)]`,
        h2: `text-[var(--typography-h2-size)] font-bold text-[var(--colors-textPrimary)] tracking-[var(--typography-h2-spacing)]`,
        h3: `text-[var(--typography-h3-size)] font-bold text-[var(--colors-textPrimary)]`,
        mono_label: `text-[var(--typography-tiny-size)] font-bold text-[var(--colors-textTertiary)] uppercase tracking-[var(--typography-tiny-spacing)] font-mono`,
        mono_code: `font-mono text-[var(--typography-code-size)] text-[var(--colors-textSecondary)]`,
        value_huge: `text-[var(--fontSizes-xxxxl)] font-bold text-[var(--colors-textPrimary)] tracking-tighter`,
    },
    effects: {
        glow_cyan: `shadow-[var(--shadows-glowPrimary)]`
    }
};
