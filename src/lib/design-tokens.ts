/**
 * TaxChecker design token reference for programmatic use (charts, PDFs, etc.).
 * CSS variables in src/styles/tokens.css are the source of truth for styling.
 */

export const colors = {
  brand: 'var(--tc-brand)',
  brandForeground: 'var(--tc-brand-foreground)',
  ink: 'var(--tc-ink)',
  paper: 'var(--tc-paper)',
  link: 'var(--tc-link)',
  savings: 'var(--tc-savings)',
  liability: 'var(--tc-liability)',
  info: 'var(--tc-info)',
  warning: 'var(--tc-warning)',
  danger: 'var(--tc-danger)',
} as const;

export const typography = {
  fontSans: 'var(--font-geist-sans)',
  fontMono: 'var(--font-geist-mono)',
  sizes: {
    xs: 'var(--tc-text-xs)',
    sm: 'var(--tc-text-sm)',
    base: 'var(--tc-text-base)',
    lg: 'var(--tc-text-lg)',
    xl: 'var(--tc-text-xl)',
    '2xl': 'var(--tc-text-2xl)',
    '3xl': 'var(--tc-text-3xl)',
    '4xl': 'var(--tc-text-4xl)',
    '5xl': 'var(--tc-text-5xl)',
  },
  leading: {
    tight: 'var(--tc-leading-tight)',
    snug: 'var(--tc-leading-snug)',
    normal: 'var(--tc-leading-normal)',
    relaxed: 'var(--tc-leading-relaxed)',
  },
} as const;

export const spacing = {
  1: 'var(--tc-space-1)',
  2: 'var(--tc-space-2)',
  3: 'var(--tc-space-3)',
  4: 'var(--tc-space-4)',
  5: 'var(--tc-space-5)',
  6: 'var(--tc-space-6)',
  8: 'var(--tc-space-8)',
  10: 'var(--tc-space-10)',
  12: 'var(--tc-space-12)',
  16: 'var(--tc-space-16)',
  20: 'var(--tc-space-20)',
  24: 'var(--tc-space-24)',
  32: 'var(--tc-space-32)',
  section: 'var(--tc-section-y)',
  sectionLg: 'var(--tc-section-y-lg)',
} as const;

export const radii = {
  sm: 'var(--tc-radius-sm)',
  md: 'var(--tc-radius-md)',
  lg: 'var(--tc-radius-lg)',
  xl: 'var(--tc-radius-xl)',
  '2xl': 'var(--tc-radius-2xl)',
} as const;

export const shadows = {
  xs: 'var(--tc-shadow-xs)',
  sm: 'var(--tc-shadow-sm)',
  md: 'var(--tc-shadow-md)',
  lg: 'var(--tc-shadow-lg)',
  ring: 'var(--tc-shadow-ring)',
} as const;

export const layout = {
  pageMax: 'var(--tc-width-page)',
  contentMax: 'var(--tc-width-content)',
  proseMax: 'var(--tc-width-prose)',
  calculatorMax: 'var(--tc-width-calculator)',
  narrowMax: 'var(--tc-width-narrow)',
} as const;
