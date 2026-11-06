import { lightColors, darkColors } from './base';
import type { ThemePreset } from './types';

export const forestTheme = {
  light: {
    tokens: {
      ...lightColors,
      'color-brand-50': '#f1f4eb',
      'color-brand-100': '#e1e9d7',
      'color-brand-500': '#628455',
      'color-brand-700': '#365c42',
      'color-brand-800': '#294a34',
      'color-focus': '#628455',
      'color-sidebar': '#f1f4eb',
    },
  },
  dark: {
    tokens: {
      ...darkColors,
      'color-brand-50': '#192f24',
      'color-brand-100': '#254432',
      'color-brand-500': '#81b895',
      'color-brand-700': '#a4d5b4',
      'color-brand-800': '#bce5c9',
      'color-focus': '#a4d5b4',
    },
  },
} satisfies ThemePreset;
