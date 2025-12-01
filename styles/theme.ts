
export const TOKENS = {
  COLORS: {
    primary: 'cyan',
    secondary: 'slate',
    danger: 'red',
    warning: 'orange',
    success: 'green',
    info: 'blue',
  },
  SURFACES: {
    panel: 'bg-slate-900 border border-slate-800',
    panel_hover: 'hover:border-cyan-500 transition-colors',
    input: 'bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none',
    card_header: 'bg-slate-950 border-b border-slate-800',
  },
  TEXT: {
    h1: 'text-xl font-bold text-white tracking-tight',
    h2: 'text-lg font-bold text-white tracking-wide',
    h3: 'text-sm font-bold text-white uppercase tracking-wider',
    body: 'text-sm text-slate-300',
    mono: 'font-mono text-xs',
    label: 'text-[10px] text-slate-500 uppercase font-bold tracking-widest',
    link: 'text-cyan-500 hover:text-cyan-400 cursor-pointer',
  }
};

export const STYLES = {
  container: 'h-full flex flex-col', // Removed padding from base container
  page_padding: 'p-4 md:p-6 space-y-4 md:space-y-6', // Added explicit padding token
  card: `${TOKENS.SURFACES.panel} rounded-xl overflow-hidden`,
  card_interactive: `${TOKENS.SURFACES.panel} ${TOKENS.SURFACES.panel_hover} rounded-xl cursor-pointer`,
  input: `w-full ${TOKENS.SURFACES.input} p-2 rounded text-white text-sm transition-all`,
  badge: 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border',
  button: {
    base: 'px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 border border-transparent',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600',
    danger: 'bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50',
    ghost: 'bg-transparent text-slate-500 hover:text-white',
    outline: 'bg-transparent border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white'
  },
  grid: {
    2: 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
    4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'
  }
};
