import { lightColors, darkColors } from './base';
import type { ThemePreset } from './types';

export const slateTheme = {
  light: {
    tokens: {
      ...lightColors,
      'color-brand-50': '#f1f5f9',
      'color-brand-100': '#e2e8f0',
      'color-brand-500': '#64748b',
      'color-brand-700': '#334155',
      'color-brand-800': '#1e293b',
      'color-focus': '#64748b',
      'color-sidebar': '#f1f5f9',
    },
  },
  dark: {
    tokens: {
      ...darkColors,
      'color-brand-50': '#253247',
      'color-brand-100': '#34455e',
      'color-brand-500': '#94a3b8',
      'color-brand-700': '#cbd5e1',
      'color-brand-800': '#e2e8f0',
      'color-focus': '#cbd5e1',
    },
  },
} satisfies ThemePreset;
