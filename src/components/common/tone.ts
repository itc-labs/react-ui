export type UITone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

export const iconToneClasses: Record<UITone, string> = {
  neutral: 'text-muted',
  brand: 'text-brand-700',
  info: 'text-info-700',
  success: 'text-success-700',
  warning: 'text-warning-700',
  danger: 'text-danger-700',
};

export const buttonToneClasses: Record<
  UITone,
  { solid: string; soft: string; outline: string; ghost: string }
> = {
  neutral: {
    solid: 'bg-ink text-surface hover:bg-muted',
    soft: 'bg-canvas text-ink hover:bg-hover-strong',
    outline: 'border border-line bg-surface text-ink hover:bg-hover',
    ghost: 'text-ink hover:bg-hover-strong',
  },
  brand: {
    solid: 'bg-brand-700 text-on-brand hover:bg-brand-800',
    soft: 'bg-brand-100 text-brand-800 hover:bg-brand-50',
    outline: 'border border-brand-700 bg-surface text-brand-700 hover:bg-brand-50',
    ghost: 'text-brand-700 hover:bg-brand-50',
  },
  info: {
    solid: 'bg-info-700 text-on-brand hover:bg-info-700/90',
    soft: 'bg-info-50 text-info-700 hover:bg-info-700/15',
    outline: 'border border-info-700 bg-surface text-info-700 hover:bg-info-50',
    ghost: 'text-info-700 hover:bg-info-50',
  },
  success: {
    solid: 'bg-success-700 text-on-brand hover:bg-success-700/90',
    soft: 'bg-success-50 text-success-700 hover:bg-success-700/15',
    outline:
      'border border-success-700 bg-surface text-success-700 hover:bg-success-50',
    ghost: 'text-success-700 hover:bg-success-50',
  },
  warning: {
    solid: 'bg-warning-700 text-on-brand hover:bg-warning-700/90',
    soft: 'bg-warning-50 text-warning-700 hover:bg-warning-700/15',
    outline:
      'border border-warning-700 bg-surface text-warning-700 hover:bg-warning-50',
    ghost: 'text-warning-700 hover:bg-warning-50',
  },
  danger: {
    solid: 'bg-danger-700 text-on-brand hover:bg-danger-800',
    soft: 'bg-danger-50 text-danger-700 hover:bg-danger-700/15',
    outline: 'border border-danger-700 bg-surface text-danger-700 hover:bg-danger-50',
    ghost: 'text-danger-700 hover:bg-danger-50',
  },
};
