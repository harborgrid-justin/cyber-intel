
export const TOKENS = {
  dark: {
    colors: {
        primary: '#06b6d4', // Cyan 500
        secondary: '#3b82f6', // Blue 500
        alert: '#ef4444', // Red 500
        success: '#10b981', // Emerald 500
        background: '#020617', // Slate 950
        surface: '#0f172a', // Slate 900
    },
    spacing: {
        sidebarWidth: '260px',
        headerHeight: '64px',
    },
    fonts: {
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    charts: {
        primary: '#06b6d4',
        grid: '#1e293b',
        text: '#64748b',
        tooltipBg: '#0f172a',
        tooltipBorder: '#334155',
        tooltipText: '#f8fafc'
    },
    graph: {
        actorNode: '#64748b',
        threatCritical: '#ef4444',
        threatHigh: '#f97316',
        threatMedium: '#eab308',
        link: '#334155',
        text: '#cbd5e1'
    }
  },
  light: {
      colors: {
        primary: '#0891b2', // Cyan 600
        secondary: '#2563eb', // Blue 600
        alert: '#dc2626', // Red 600
        success: '#059669', // Emerald 600
        background: '#f8fafc', // Slate 50
        surface: '#ffffff', // White
      },
      spacing: {
        sidebarWidth: '260px',
        headerHeight: '64px',
      },
      fonts: {
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
      charts: {
        primary: '#0891b2',
        grid: '#e2e8f0',
        text: '#475569',
        tooltipBg: '#ffffff',
        tooltipBorder: '#cbd5e1',
        tooltipText: '#1e293b'
    },
    graph: {
        actorNode: '#475569',
        threatCritical: '#dc2626',
        threatHigh: '#ea580c',
        threatMedium: '#ca8a04',
        link: '#cbd5e1',
        text: '#334155'
    }
  }
};

export const STYLES = {
    app_container: "flex h-screen bg-[var(--colors-appBg)] text-[var(--colors-textPrimary)] font-sans overflow-hidden",
    page_container: "flex-1 flex flex-col h-full bg-[var(--colors-appBg)] relative",
    page_padding: "p-4 md:p-6 lg:p-8",
    card: "bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-[var(--components-card-radius)] shadow-sm",
    card_interactive: "bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-[var(--components-card-radius)] shadow-sm hover:border-[var(--colors-borderHighlight)] hover:shadow-md transition-all cursor-pointer",
    button: {
        base: "inline-flex items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-wider",
        primary: "bg-[var(--colors-primary)] hover:bg-[var(--colors-primary)]/90 text-white focus:ring-[var(--colors-primary)]",
        secondary: "bg-[var(--colors-surfaceHighlight)] hover:bg-[var(--colors-surfaceRaised)] text-[var(--colors-textPrimary)] border border-[var(--colors-borderDefault)] focus:ring-slate-500",
        danger: "bg-[var(--colors-error)] hover:bg-[var(--colors-error)]/90 text-white focus:ring-[var(--colors-error)]",
        ghost: "bg-transparent hover:bg-[var(--colors-surfaceHighlight)] text-[var(--colors-textSecondary)] hover:text-[var(--colors-textPrimary)]",
        outline: "bg-transparent border border-[var(--colors-borderDefault)] hover:border-[var(--colors-borderHighlight)] text-[var(--colors-textSecondary)] hover:text-[var(--colors-textPrimary)]"
    },
    input: "bg-[var(--colors-surfaceInput)] border border-[var(--colors-borderInput)] text-[var(--colors-textPrimary)] placeholder-[var(--colors-textPlaceholder)] rounded focus:outline-none focus:border-[var(--colors-borderFocus)] focus:ring-1 focus:ring-[var(--colors-borderFocus)] transition-shadow",
    badge: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide",
};

export const EXECUTIVE_THEME = {
    typography: {
        h1: "text-2xl md:text-3xl font-bold tracking-tight text-[var(--colors-textPrimary)]",
        h2: "text-xl md:text-2xl font-bold tracking-tight text-[var(--colors-textPrimary)]",
        h3: "text-lg font-bold text-[var(--colors-textPrimary)] uppercase tracking-wider",
        body: "text-sm text-[var(--colors-textSecondary)] leading-relaxed",
        mono_code: "font-mono text-xs text-[var(--colors-textTertiary)]",
        mono_label: "font-mono text-[10px] uppercase tracking-widest text-[var(--colors-textTertiary)] font-bold",
        value_huge: "text-3xl md:text-4xl font-bold font-mono tracking-tighter text-[var(--colors-textPrimary)]"
    },
    surfaces: {
        app_container: "bg-[var(--colors-appBg)]",
        card_base: "bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)]",
        panel_raised: "bg-[var(--colors-surfaceRaised)] border border-[var(--colors-borderDefault)]",
        input_field: "bg-[var(--colors-surfaceInput)] border border-[var(--colors-borderInput)] text-[var(--colors-textPrimary)]"
    }
};
