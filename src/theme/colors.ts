/** Typed CSS references. tokens.css remains the only source of color values. */
export const themeColors = Object.freeze({
  canvas: 'var(--color-canvas)',
  surface: 'var(--color-surface)',
  sidebar: 'var(--color-sidebar)',
  ink: 'var(--color-ink)',
  muted: 'var(--color-muted)',
  line: 'var(--color-line)',
  controlBorder: 'var(--color-control-border)',
  onBrand: 'var(--color-on-brand)',
  brand: Object.freeze({
    50: 'var(--color-brand-50)',
    100: 'var(--color-brand-100)',
    500: 'var(--color-brand-500)',
    700: 'var(--color-brand-700)',
    800: 'var(--color-brand-800)',
  }),
  info: Object.freeze({
    50: 'var(--color-info-50)',
    700: 'var(--color-info-700)',
  }),
  success: Object.freeze({
    50: 'var(--color-success-50)',
    700: 'var(--color-success-700)',
  }),
  warning: Object.freeze({
    50: 'var(--color-warning-50)',
    700: 'var(--color-warning-700)',
  }),
  rating: 'var(--color-rating)',
  ratingEmpty: 'var(--color-rating-empty)',
  danger: Object.freeze({
    50: 'var(--color-danger-50)',
    700: 'var(--color-danger-700)',
    800: 'var(--color-danger-800)',
  }),
  chart: Object.freeze([
    'var(--color-chart-1)',
    'var(--color-chart-2)',
    'var(--color-chart-3)',
    'var(--color-chart-4)',
    'var(--color-chart-5)',
    'var(--color-chart-6)',
  ] as const),
});

export type ThemeColors = typeof themeColors;
